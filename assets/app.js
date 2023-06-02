import React, {Component} from 'react';
import {createRoot} from 'react-dom/client';
import Tree from './components/Tree/index'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import axios from "axios";
import Emitter from './services/emitter';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import _ from 'lodash';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            raw: [],
            tree1: [],
            tree2: []
        }

        Emitter.on('add_new_node', (data) => {
            this.createTreeNode(data);
        });

        Emitter.on('delete_node', (node) => {
            this.deleteTreeNode(node);
        });

        Emitter.on('get_related_to_node', (node) => {
            //this.getRelatedToNode(node);
            this.getRelatedToNode2(node);
        });

        Emitter.on('save_node', (node) => {
            this.saveNode(node);
        });

        //this.readTreeData();
        this.readTreeData2();
    }

    createTreeNode(data) {
        let requestData = {
            parent_id: data.parent.nid,
            name: data.name
        }

        axios.post('/api/tree/add', requestData)
            .then(response => {
                data.parent.children.push(response.data.node);
                let tree1 = this.state.tree1;
                this.setState({
                    tree1: tree1
                });
            })
            .catch(error => {
                console.log(error);
            });
    }

    readTreeData() {
        axios.get('/api/tree/read')
            .then(response => {
                let tree1 = this.buildTree(response.data);
                this.setState({
                    raw: response.data,
                    tree1: tree1
                });
            })
            .catch(error => {
                console.log(error);
            });
    }

    readTreeData2() {
        axios.get('/api/tree/read2')
            .then(response => {
                let raw = response.data.raw;
                let tree1 = response.data.tree;
                this.setState({
                    raw: raw,
                    tree1: tree1
                });
            })
            .catch(error => {
                console.log(error);
            });
    }

    deleteTreeNode(data) {
        let ids = [data.node.nid];
        if (data.node.children) {
            ids = this.getIds(data.node.children, ids);
        }

        axios.post('/api/tree/delete', {ids: ids})
            .then(response => {
                let tree1 = this.state.tree1;
                this.removeNode(tree1, data.node);
                this.setState({
                    tree1: tree1
                });
            })
            .catch(error => {
                console.log(error);
            });

    }
    getIds(data, ids) {
        data.forEach(r => {
            ids.push(r.nid);
            if (r.children) {
                ids = this.getIds(r.children, ids);
            }
        });

        return ids;
    }

    removeNode(tree, node) {
        tree.every(r => {
           if (r.nid == node.parent_id) {
               r.children = r.children.filter(c => c.nid != node.nid);
               return false;
            }
            this.removeNode(r.children, node);
        });
    }

    getRelatedToNode(node) {
        axios.post('/api/tree/related', { node: node })
            .then(response => {
                let nodes = response.data.nodes;
                let data = _.orderBy(nodes, ['id'], ['asc']);
                let tree2 = this.buildTree(data);
                this.setState({
                    tree2: tree2
                });
            })
            .catch(error => {
                console.log(error);
            });
    }

    getRelatedToNode2(node) {
        let raw = this.state.raw;
        let childIds = this.getIds(node.children, []);
        let parentSiblingIds = Array.from(this.getSiblingWithParentIds(raw, node.parent_id, node, new Set()));

        let allIds = [...parentSiblingIds, ...childIds];

        axios.post('/api/tree/related', { node: node, ids: allIds })
            .then(response => {
                let nodes = response.data.nodes;
                let data = _.orderBy(nodes, ['id'], ['asc']);
                let tree2 = this.buildTree(data);
                this.setState({
                    tree2: tree2
                });
            })
            .catch(error => {
                console.log(error);
            });
    }

    getSiblingWithParentIds(data, parentId, node, ids) {
        data.some(r => {
            if (r.parent_id == node.parent_id) {
                ids.add(r.nid);
            }

            if (r.nid == parentId) {
               ids.add(r.nid);
               parentId = r.parent_id;

               if (parentId > 0) {
                   ids = this.getSiblingWithParentIds(data, parentId, node, ids);
               }

               return false;
           }
        });

        return ids;
    }

    saveNode(node) {
        axios.post('/api/tree/node/save', { node: node })
            .then(response => {
                console.log(response);
            })
            .catch(error => {
                console.log(error);
            });
    }

    buildTree(data = [], parent_id = 0) {
        let tree = [];
        data.forEach(r => {
            if (r.parent_id == parent_id) {
                let children = this.buildTree(data, r.id);
                let node = {
                    id: r.id,
                    parent_id: r.parent_id,
                    name: r.name,
                    children: children,
                    relation: r.relation
                }
                tree.push(node);
            }
        });
        return tree;

    }

    render() {
        return (
            <div className="d-flex flex-row flex-nowrap trees">
                <Card>
                    <CardContent>
                        <Tree data={this.state.tree1} main={true} key={'tree1'}></Tree>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <Tree data={this.state.tree2} main={false} key={'tree2'}></Tree>
                    </CardContent>
                </Card>
            </div>
        );
    }
}

const domNode = document.getElementById('root');
const root = createRoot(domNode);
root.render(<App/>)
