import React, {createContext} from 'react';

export const TreeContext = createContext();

class TreeContextProvider extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            tree: [
                {
                    key: "0",
                    label: "Documents",
                    icon: "fa fa-folder",
                    title: "Documents Folder",
                    children: [
                        {
                            key: "0-0",
                            label: "Document 1-1",
                            icon: "fa fa-folder",
                            title: "Documents Folder",
                            children: [
                                {
                                    key: "0-1-1",
                                    label: "Document-0-1.doc",
                                    icon: "fa fa-file",
                                    title: "Documents Folder",
                                },
                                {
                                    key: "0-1-2",
                                    label: "Document-0-2.doc",
                                    icon: "fa fa-file",
                                    title: "Documents Folder",
                                },
                                {
                                    key: "0-1-3",
                                    label: "Document-0-3.doc",
                                    icon: "fa fa-file",
                                    title: "Documents Folder",
                                },
                                {
                                    key: "0-1-4",
                                    label: "Document-0-4.doc",
                                    icon: "fa fa-file",
                                    title: "Documents Folder",
                                },
                            ],
                        },
                    ],
                },
                {
                    key: "1",
                    label: "Desktop",
                    icon: "fa fa-desktop",
                    title: "Desktop Folder",
                    children: [
                        {
                            key: "1-0",
                            label: "document1.doc",
                            icon: "fa fa-file",
                            title: "Documents Folder",
                        },
                        {
                            key: "1-1",
                            label: "documennt-2.doc",
                            icon: "fa fa-file",
                            title: "Documents Folder",
                        },
                    ],
                },
                {
                    key: "2",
                    label: "Downloads",
                    icon: "fa fa-download",
                    title: "Downloads Folder",
                    children: [],
                },
            ],
            selected: []
        }
    }

    // create
    createNode(parent, child) {
        parent.children.push(child);
    }

    // read
    readNodes() {

    }

    // update
    updateNode() {

    }

    // delete
    deleteNode() {

    }

    render() {
        return (
            <TreeContext.Provider value={{
                ...this.state,
                createNode: this.createNode.bind(this),
                readNodes: this.readNodes.bind(this),
                updateNode: this.updateNode.bind(this),
                deleteNode: this.deleteNode.bind(this)
            }}>
                {this.props.children}
            </TreeContext.Provider>
        );
    }
}

export default TreeContextProvider;