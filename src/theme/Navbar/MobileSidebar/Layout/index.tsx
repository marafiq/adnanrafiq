import React from 'react';
import type {Props} from '@theme/Navbar/MobileSidebar/Layout';
import {useNavbarSecondaryMenu} from '@docusaurus/theme-common/internal';

// Keep Docusaurus' controls and article index, with the main routes always first.
export default function MobileSidebarLayout({header, primaryMenu, secondaryMenu}: Props): React.JSX.Element {
  const {content} = useNavbarSecondaryMenu();
  return <div className="navbar-sidebar">
    {header}
    <div className="editorial-mobile-menu navbar-sidebar__item menu">
      {primaryMenu}
      {content && <div className="editorial-mobile-index">
        {secondaryMenu}
      </div>}
    </div>
  </div>;
}
