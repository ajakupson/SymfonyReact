import * as React from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';

import {IconButton, TextField} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CallMissedOutgoingIcon from '@mui/icons-material/CallMissedOutgoing';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import './index.css';
import Emitter from '../../services/emitter';


const TreeContainer = ({ data = [], main = false }) => {
    const [selectedNode, setSelectedNode] = React.useState(null);
    const [newNodeName, setNewNodeName] = React.useState('');
    const [newNodeDialogOpen, setNewNodeDialogOpen] = React.useState(false);
    const [deleteNodeDialogOpen, setDeleteNodeDialogOpen] = React.useState(false);

    Emitter.once('show_new_node_dialog', (node) => {
        if (main) {
            setSelectedNode(node);
            setNewNodeDialogOpen(true);
        }
    });

    const newNodeDialogClose = () => {
        setNewNodeDialogOpen(false);
    };

    const newNodeAddEvent = () => {
        setNewNodeDialogOpen(false);
        Emitter.emit('add_new_node', { parent: selectedNode, name: newNodeName });
    }

    Emitter.once('show_delete_node_dialog', (node) => {
        if (main) {
            setSelectedNode(node);
            setDeleteNodeDialogOpen(true);
        }
    });

    const deleteNodeDialogClose = () => {
        setDeleteNodeDialogOpen(false);
    };

    const nodeDeleteEvent = () => {
        setDeleteNodeDialogOpen(false);
        Emitter.emit('delete_node', { node: selectedNode });
    }

    return (
        <div>
            <Tree data={data} main={main}/>

            <Dialog open={newNodeDialogOpen} onClose={newNodeDialogClose}>
                <DialogTitle>New node</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        New entry will be added for the selected node
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="node"
                        label="Node name"
                        type="text"
                        fullWidth={true}
                        variant="standard"
                        onChange={(event) => setNewNodeName(event.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={newNodeDialogClose}>Cancel</Button>
                    <Button onClick={newNodeAddEvent}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteNodeDialogOpen} onClose={deleteNodeDialogClose}
            >
                <DialogTitle>Delete node</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete selected node?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={deleteNodeDialogClose}>No</Button>
                    <Button onClick={nodeDeleteEvent}>Yes</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

const Tree = ({ data = [], main = false, counter = 0 }) => {
    return (
        <List sx={{width: '100%', bgcolor: 'background.paper'}} component="div" className="pt-0 pb-0">
            {data.map((tree, index) => (
                <TreeNode node={tree} main={main} counter={counter} key={'node_' + index}/>
            ))}
        </List>
    );
};

const TreeNode = ({ node = [], main = false, counter = 0 }) => {
    const hasChild = node.children && node.children.length;
    const [edit, setEdit] = React.useState(false);
    const [open, setOpen] = React.useState(false);

    const toggleOpen = () => {
        setOpen(!open);
    };

    const toggleEdit = () => {
        setEdit(!edit);
    };

    const setName = (value) => {
        node.name = value;
    }

    const showNewNodeDialog = () => {
        Emitter.emit('show_new_node_dialog', node);
    }

    const showDeleteNodeDialog = () => {
        Emitter.emit('show_delete_node_dialog', node);
    }

    const emitRelatedEvent = () => {
        main ? Emitter.emit('get_related_to_node', node) : false;
    }

    const saveNode = () => {
        Emitter.emit('save_node', node);
    }

    return (
        <div className="d-tree-node border-0" key={node.id} style={{paddingLeft: counter * 10 + 'px'}}>
            <ListItemButton>
                {
                    !edit ?
                        <ListItemText primary={node.name} secondary={node.relation} className="mr-2"/> :
                        <TextField label={node.name} variant="standard" onChange={e => setName(e.target.value)} fullWidth={true}/>
                }

                {
                    main &&
                    <IconButton onClick={toggleEdit}>
                        {!edit ? <EditIcon/> : <CheckIcon onClick={saveNode}/>}
                    </IconButton>
                }

                {
                    main &&
                    <IconButton onClick={showNewNodeDialog}>
                        <AddIcon/>
                    </IconButton>
                }
                {
                    main &&
                    <IconButton onClick={showDeleteNodeDialog}>
                        <DeleteIcon/>
                    </IconButton>

                }

                {
                    main &&
                    <IconButton onClick={emitRelatedEvent}>
                        <CallMissedOutgoingIcon/>
                    </IconButton>
                }

                {
                    hasChild ?
                    <IconButton onClick={toggleOpen}>
                        {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton> : ""
                }
            </ListItemButton>

            {
                hasChild && open ?
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Tree data={node.children} main={main} counter={++counter}/>
                </Collapse> : ""
            }
        </div>
    );
};

export default TreeContainer;