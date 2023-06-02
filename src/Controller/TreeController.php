<?php

namespace App\Controller;

use App\Entity\Node;
use App\Repository\NodeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/tree', name: 'app_tree')]
class TreeController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private NodeRepository $nodeRepository;

    public function __construct(EntityManagerInterface $entityManager, NodeRepository $nodeRepository) {

        $this->entityManager = $entityManager;
        $this->nodeRepository = $nodeRepository;
    }

    #[Route('/read', name: 'api_tree_read')]
    public function getTreeData(): Response
    {
        $nodes = $this->nodeRepository->findAll();
        $out = [];
        foreach($nodes as $node) {
            $out[] = $node->toArray();
        }

        $out = $this->nodeRepository->buildTree();
        return $this->json($out);
    }

    #[Route('/read2', name: 'api_tree_read2')]
    public function getTreeData2(): Response
    {
        $out = $this->nodeRepository->buildTree();
        return $this->json($out);
    }

    #[Route('/add', name: 'api_tree_add_node')]
    public function treeAddNode(Request $request): Response
    {
        $content = json_decode($request->getContent());

        $node = new Node();
        $node->setParentId($content->parent_id);
        $node->setName($content->name);

        try {
            $this->entityManager->persist($node);
            $this->entityManager->flush();

            return $this->json([
                'node' => $node->toArray()
            ]);
        } catch (\Exception $exception) {
            return $this->json([
                'error' => $exception->getMessage()
            ]);
        }
    }

    #[Route('/delete', name: 'api_tree_delete_node')]
    public function treeDeleteNode(Request $request): Response
    {
        $content = json_decode($request->getContent());
        $ids = $content->ids;

        try {
            $this->nodeRepository->deleteByIds($ids);
            return $this->json([
                'ids' => $ids
            ]);
        } catch (\Exception $exception) {
            return $this->json([
                'error' => $exception->getMessage()
            ]);
        }
    }

    #[Route('/related', name: 'api_tree_node_related')]
    public function getNodeRelated(Request $request): Response
    {
        $content = json_decode($request->getContent());
        $node = $content->node;
        $ids = $content->ids;

        $entities = $this->nodeRepository->getByIds($ids);
        $nodes = [];
        foreach ($entities as $key => $entity) {
            $nodes[] = $entity->toArray();
        }

        $children = [
            'ids' => [],
            'nodes' => []
        ];
        foreach ($nodes as $nd) {
            if ($node->nid == $nd['parent_id'] || in_array($nd['parent_id'], $children['ids'])) {
                $children['ids'][] = $nd['id'];
                $nd['relation'] = 'child';
                $children['nodes'][] = $nd;
            }
        }

        $parents = [
            'ids' => [$node->parent_id],
            'nodes' => []
        ];
        $siblings = [
            'ids' => [],
            'nodes' => []
        ];
        array_multisort(array_column($nodes, 'id'), SORT_DESC, $nodes);
        foreach($nodes as $nd) {
            if ($nd['parent_id'] == $node->parent_id && $node->nid != $nd['id']) {
                $siblings['ids'][] = $nd['id'];
                $nd['relation'] = 'sibling';
                $siblings['nodes'][] = $nd;
            }

            if (in_array($nd['id'], $parents['ids'])) {
                $parents['ids'][] = $nd['parent_id'];
                $nd['relation'] = 'parent';
                $parents['nodes'][] = $nd;
            }
        }

        $selected = [
            'id' => $node->nid,
            'parent_id' => $node->parent_id,
            'name' => $node->name,
            'relation' => null,
        ];

        $out = array_merge($parents['nodes'], $siblings['nodes'], $children['nodes'], [$selected]);
        array_multisort(array_column($out, 'name'), SORT_ASC, $out);

        return $this->json(['nodes' => $out]);
    }

    #[Route('/node/save', name: 'api_tree_node_save')]
    public function saveNode(Request $request): Response
    {
        $content = json_decode($request->getContent());
        $node = $content->node;

        try {
            $entity = $this->entityManager->getReference('App\Entity\Node', $node->nid);
            $entity->setName($node->name);
            $this->entityManager->persist($entity);
            $this->entityManager->flush();
        } catch (\Exception $exception) {
            return $this->json([
                'error' => $exception->getMessage()
            ]);
        }

        return $this->json(['node' => $node]);
    }

    private function buildTree($data = [], $parentId = 0, $level = 0) {
        $level++;
        $tree = [];
        foreach ($data as $record) {
            if ($record['parent_id'] == $parentId) {
                $children = $this->buildTree($data, $record['id'], $level);
                $node = [
                    'id' => $record['id'],
                    'parent_id' => $record['parent_id'],
                    'name' => $record['name'],
                    'level' => $level,
                    'relation' => null,
                    'children' => $children
                ];
                $tree[] = $node;
            }
        }

        return $tree;
    }
}
