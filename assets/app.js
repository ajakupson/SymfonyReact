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
            this.getRelatedToNode(node);
        });

        Emitter.on('save_node', (node) => {
            this.saveNode(node);
        });

        this.readTreeData();
    }

    createTreeNode(data) {
        let requestData = {
            parent_id: data.parent.id,
            name: data.name
        }

        axios.post('/api/tree/add', requestData)
            .then(response => {
                let raw = this.state.raw;
                raw.push(response.data.node);
                let tree1 = this.buildTree(raw);

                this.setState({
                    raw: raw,
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

    deleteTreeNode(data) {
        let ids = [data.node.id];
        if (data.node.children) {
            ids = this.getIdsForDeletion(data.node.children, ids);
        }

        axios.post('/api/tree/delete', {ids: ids})
            .then(response => {
                let raw = this.state.raw.filter(r => !ids.includes(r.id));
                let tree1 = this.buildTree(raw);

                this.setState({
                    raw: raw,
                    tree1: tree1
                });
            })
            .catch(error => {
                console.log(error);
            });

    }
    getIdsForDeletion(data, ids) {
        data.forEach(r => {
            ids.push(r.id);
            if (r.children) {
                ids = this.getIdsForDeletion(r.children, ids);
            }
        });

        return ids;
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
