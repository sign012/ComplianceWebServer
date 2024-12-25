/*vuex ts*/
import { RouterTy } from '@/types/router';

interface StateTy {
  app: AppTy;
  permission: PermissionTy;
  user: UserTy;
}

interface UserTy {
  userMgrType: string;
  yzmid?: string;
  userid?: string;
  username: string;
  avatar: string;
  roles: Array<string>;
  userOrg?: string;
  userDept?: string;
  userType?: string;
  isEditor: boolean;
  isAuditor: boolean;
  departId: string;
  userList: Array<string>;
  checkedDept: string;
  wupUrl: string;
  accessDeptIds:Array<number>;
  accessDeptList:Array<number>;
}

interface AppTy {
  sidebar: {
    opened: boolean;
    //opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    // withoutAnimation: false
  };
  device: 'desktop';
  cachedViews: Array<string>;
  wupUrl: string;
  comName: string;
}
interface PermissionTy {
  isGetUserInfo: boolean; //是否已经设置了权限
  routes: RouterTy; //将过滤后的异步路由和静态路由集合
  addRoutes: RouterTy; //过滤后的异步路由
  isLivePage: boolean; //是否是直播页面
}
