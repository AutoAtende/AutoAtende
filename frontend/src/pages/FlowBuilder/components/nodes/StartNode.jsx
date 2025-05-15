import React, { memo } from 'react';
import { Position } from '@xyflow/react';
import { PlayArrow as PlayArrowIcon, Code as CodeIcon } from '@mui/icons-material';
import { i18n } from "../../../../translate/i18n";
import BaseFlowNode from './BaseFlowNode';

const StartNode = ({ id, data, selected }) => {
  return (
    <BaseFlowNode
      id={id}
      nodeType="start"
      type={i18n.t('flowBuilder.nodes.start')}
      data={data}
      selected={selected}
      icon={PlayArrowIcon}
      canDuplicate={false}
      canDelete={false}
      canEdit={false}
      handles={{
        source: { enabled: true, position: Position.Bottom },
        target: { enabled: false }
      }}
      noContent={true}
    />
  );
};

export default memo(StartNode);