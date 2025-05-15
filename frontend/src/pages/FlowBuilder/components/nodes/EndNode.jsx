import React, { memo, useCallback } from 'react';
import { Position, useReactFlow } from '@xyflow/react';
import { Stop as StopIcon } from '@mui/icons-material';
import { i18n } from "../../../../translate/i18n";
import BaseFlowNode from './BaseFlowNode';

const EndNode = ({ id, data, selected }) => {
  const reactFlowInstance = useReactFlow();
  
  const handleDelete = useCallback((event) => {
    event.stopPropagation();
    reactFlowInstance.deleteElements({ nodes: [{ id }] });
  }, [id, reactFlowInstance]);
  
  const handleDuplicate = useCallback((event) => {
    event.stopPropagation();
    // Clone do nó atual
    const position = reactFlowInstance.getNode(id).position;
    const newNode = {
      id: `end_${Date.now()}`,
      type: 'endNode',
      position: {
        x: position.x + 20,
        y: position.y + 20
      },
      data: { ...data }
    };
    
    reactFlowInstance.addNodes(newNode);
  }, [id, data, reactFlowInstance]);
  
  return (
    <BaseFlowNode
      id={id}
      nodeType="end"
      type={i18n.t('flowBuilder.nodes.end')}
      data={data}
      selected={selected}
      icon={StopIcon}
      canDuplicate={false}
      canDelete={true} 
      canEdit={false}
      handles={{
        source: { enabled: false },
        target: { enabled: true, position: Position.Top }
      }}
      noContent={true}
      onDelete={handleDelete}
    />
  );
};

export default memo(EndNode);