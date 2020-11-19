import { useLocation } from '@reach/router'
import * as React from 'react'
import { useContext, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useMediaQuery } from 'react-responsive'
import { breakpoints } from '../../style/breakpoints'
import { MenuIcon } from '../../style/icons'
import { style } from '../../style/styled'
import { UserContext } from '../auth/user'
import { addToastListener, removeToastListener, Toast, ToastType } from '../toast/toast'
import { link } from './Link'
import { getChatPath, getLoginPath, getLoginPathTwo, getPath, getProfilePath, getSignupPath, getSignupPathTwo, getSurveyPath, Route } from './route'

const title = {
  name: 'EventWorks',
  path: getPath(Route.HOME),
  title: true,
}

const otherTabs = [
  /*{
    name: 'lectures',
    path: getPath(Route.LECTURES),
  },
  {
    name: 'projects',
    path: getPath(Route.PROJECTS),
  },
  {
    name: 'playground',
    path: getPath(Route.PLAYGROUND),
  },*/
  {
    name: 'find event',
    path: getPath(Route.FIND_EVENT),
  },
  {
    name: 'create event',
    path: getPath(Route.CREATE_FORM),
  },
  {
    name: 'create table',
    path: getPath(Route.CREATE_TABLE_FORM),
  },
  {
    name: 'account',
    path: getPath(Route.LOGIN_SIGNUP),
  }
  /*{
    name: 'event',
    path: getPath(Route.MAP),
  },*/
]

export function NavBar() {
  const location = useLocation()
  const isSmall = useMediaQuery(breakpoints.small)
  const [showMenu, setShowMenu] = React.useState(false)
  const [toast, setToast] = React.useState<Toast | null>(null)

  function onToast(feedback: Toast) {
    setToast(feedback)
  }

  useEffect(() => {
    addToastListener(onToast)
    return () => removeToastListener(onToast)
  }, []) // only call on mount and unmount

  // clear toast after 3 secs whenever it changes to a non-empty value
  useEffect(() => {
    if (toast) {
      const timeout = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timeout)
    }
    return void 0
  }, [toast])

  const tabs = isSmall ? [otherTabs.find(t => location.pathname.startsWith(t.path)) || otherTabs[0]] : otherTabs

  return (
    <>
      <div className="fixed top-0 left-0 w-100 avenir">
        {/* mount point for NavMenu */}
        <div id="nav-modal" />
        <Nav>
          <NavItem {...title} />

          {/* push tab to the right on small screens */}
          {isSmall && <div style={{ flex: 1 }} />}

          {/* layout additional tabs (possibly hidden for small screens) */}
          {tabs.map((tab, i) => (
            <NavItem key={i} {...tab} />
          ))}

          {isSmall && <NavMenu show={showMenu} onClick={() => setShowMenu(!showMenu)} />}
        </Nav>
        <SubNav />
      </div>
      {toast && <ToastContainer $isError={toast.type === ToastType.ERROR}>{toast.message}</ToastContainer>}
    </>
  )
}

function NavMenu(props: { show: boolean; onClick: () => void }) {
  return (
    <NavMenuButton onClick={props.onClick}>
      <MenuIcon />
      {props.show && (
        <Modal>
          <NavMenuModal>
            {otherTabs.map((tab, i) => (
              <NavItem key={i} {...tab} />
            ))}
          </NavMenuModal>
        </Modal>
      )}
    </NavMenuButton>
  )
}

function SubNav() {
  const location = useLocation()
  const { user } = useContext(UserContext)
  if (location.pathname.startsWith(getPath(Route.PLAYGROUND))) {
    return (
      <Nav $isSubNav>
        <NavItem name="surveys" path={getSurveyPath()} />
        {!user && <NavItem name="signup" path={getSignupPath()} />}
        <NavItem name={user ? 'logout' : 'login'} path={getLoginPath()} />
      </Nav>
    )
  }
  else if (location.pathname.startsWith(getPath(Route.LOGIN_SIGNUP))) {
    return (
      <Nav $isSubNav>
        {user && <NavItem name="chat" path={getChatPath()} />}
        {user && <NavItem name="profile" path={getProfilePath()} />}
        {!user && <NavItem name="signup" path={getSignupPathTwo()} />}
        <NavItem name={user ? 'logout' : 'login'} path={getLoginPathTwo()} />
      </Nav>
    )
  }
  return null
}

const Nav = style(
  'nav',
  'flex white items-center list pa2 ph4 ph5-ns ph7-l avenir f4',
  (p: { $isSubNav?: boolean }) => ({
    background: `linear-gradient(90deg, ${'#005587'} 0%, ${'#2774AE'} 100%)`,
    opacity: '0.9',
    paddingTop: p.$isSubNav ? 0 : undefined,
    paddingBottom: p.$isSubNav ? 0 : undefined,
    justifyContent: p.$isSubNav ? 'flex-end' : 'space-between',
  })
)

function NavItem(props: { name: string; path: string; title?: boolean }) {
  const location = useLocation()
  const { user } = useContext(UserContext)

  return (
    <NavLink $title={props.title} $bold={props.title || location.pathname.startsWith(props.path)} to={props.path}>
      {!user ? ((props.name == "create event" || props.name == "find event" || props.name == "create table") ? "" : props.name) : props.name}
    </NavLink>
  )
}

const NavAnchor = style(
  'a',
  'link near-white hover-bg-black-10 pa2 br2',
  (p: { $bold?: boolean; $title?: boolean }) => ({
    fontWeight: p.$bold ? 600 : 200,
    fontSize: p.$title ? '1.5em' : undefined,
  })
)
const NavLink = link(NavAnchor)

const NavMenuButton = style('div', 'ml3 pa2 hover-bg-black-10 pointer')

const NavMenuModal = style(
  'div',
  'avenir f4 fixed flex flex-column items-center top-0 br3 pa3 right-0 bg-black-90 mt5 mr4 mr5-ns',
  { zIndex: 100 }
)

const ToastContainer = style<'div', { $isError?: boolean }>(
  'div',
  'avenir f5 fixed bottom-0 white right-0 br3 pa3 bg-black-90 mb3 mr4 mr5-ns mr7-l',
  () => ({
    // color: p.$theme.textColor(p.$isError),
    zIndex: 100,
  })
)

function Modal(props: { children: React.ReactNode }) {
  return ReactDOM.createPortal(props.children, document.querySelector('#nav-modal')!)
}
