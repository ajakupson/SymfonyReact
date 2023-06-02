<?php

namespace App\Repository;

use App\Entity\Node;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Node>
 *
 * @method Node|null find($id, $lockMode = null, $lockVersion = null)
 * @method Node|null findOneBy(array $criteria, array $orderBy = null)
 * @method Node[]    findAll()
 * @method Node[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class NodeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Node::class);
    }

    public function save(Node $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Node $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function deleteByIds($ids) {
        return $this->createQueryBuilder('n')
            ->where('n.id in (:ids)')
            ->setParameter('ids', $ids, ArrayParameterType::INTEGER)
            ->delete()
            ->getQuery()
            ->getResult();
    }

    public function getByIds($ids) {
        return $this->createQueryBuilder('n')
            ->where('n.id in (:ids)')
            ->setParameter('ids', $ids, ArrayParameterType::INTEGER)
            ->getQuery()
            ->getResult();
    }

    public function getNodesWithChilds() {
        $rawSql = 'WITH children AS (SELECT parent_id, GROUP_CONCAT(id) as childs FROM node GROUP BY parent_id),
                        nodes AS (SELECT * FROM node)
                   SELECT nodes.id, nodes.id as nid, nodes.parent_id, nodes.name, children.childs 
                    FROM nodes 
                   LEFT JOIN children ON nodes.id = children.parent_id';

        $statement = $this->getEntityManager()->getConnection()->prepare($rawSql);
        return $statement->executeQuery()->fetchAllAssociativeIndexed();
    }

    public function buildTree() {
        $raw = $this->getNodesWithChilds();
        $data = $raw;

        $roots = [];
        foreach ($data as &$row) {
            if ($row['parent_id'] == 0) {
                $roots[$row['nid']] = true;
            }

            $row['children'] = [];
            $childs = array_filter(explode(',', $row['childs']));
            foreach ($childs as $child) {
                if (isset($data[$child])) {
                    $row['children'][] =& $data[$child];
                }
            }
        }

        $tree = [];
        foreach ($roots as $id => $value) {
            $tree[] = $data[$id];
        }

        return ['raw' => array_values($raw), 'tree' => $tree];
    }

//    /**
//     * @return Node[] Returns an array of Node objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('n')
//            ->andWhere('n.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('n.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?Node
//    {
//        return $this->createQueryBuilder('n')
//            ->andWhere('n.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
