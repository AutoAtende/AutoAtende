import React from 'react';
import SvgIcon from '@mui/material/SvgIcon';

export default function DemoIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5.97 4.06L14.09 11l-1.06 3.94-1.94-3.94-2.03 3.94-1.06-3.94L9.06 7.06 7 11l1.06 3.94c.12.44.5.75.94.75s.82-.31.94-.75L12 11l2.06 3.94c.12.44.5.75.94.75s.82-.31.94-.75L17 11l-3.97-3.94z" />
    </SvgIcon>
  );
}