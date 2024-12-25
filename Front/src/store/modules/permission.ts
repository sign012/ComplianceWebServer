import { constantRoutes, asyncRoutes } from '@/router';
import settings from '@/settings';
import { PermissionTy } from '@/types/store';
import { RouteItemTy, RouterRowTy, RouterTy } from '@/types/router';
import { ObjTy } from '@/types/common';
import { getMenuReq } from '@/api/user';
import Layout from '@/layout';
const modules = import.meta.glob('../../views/*/*.vue');
/**
 * Use meta.code to determine if the current user has permission
 * @param codeArr
 * @param routeItem
 */
function hasCodePermission(codeArr: Array<number>, routeItem: RouteItemTy) {
  if (routeItem.meta && routeItem.meta.code) {
    return codeArr.includes(routeItem.meta.code) || routeItem.hidden;
  } else {
    return true;
  }
}
/**
 * Use meta.code to determine if the current user has permission
 * @param codeArr
 * @param asyncRoutes
 */
function filterRouterByCodeArr(codeArr: Array<number>, asyncRoutes: RouterTy): Promise<RouterTy> {
  return new Promise((resolve) => {
    const filterRouter: RouterTy = [];
    asyncRoutes.forEach(async (routeItem: RouterRowTy) => {
      if (hasCodePermission(codeArr, routeItem)) {
        if (routeItem.children) {
          routeItem.children = await filterRouterByCodeArr(codeArr, routeItem.children);
        }
        filterRouter.push(routeItem);
      }
    });
    resolve(filterRouter);
  });
}

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles: Array<string>, route: RouteItemTy) {
  if (route.meta && route.meta.roles) {
    return roles.some((role) => route.meta?.roles?.includes(role));
  } else {
    return true;
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes: RouterTy, roles: Array<string>) {
  const res: RouterTy = [];
  routes.forEach((route) => {
    const tmp = { ...route };
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles);
      }
      res.push(tmp);
    }
  });

  return res;
}

const state: PermissionTy = {
  isGetUserInfo: false, // get userInfo
  routes: [], //将过滤后的异步路由和静态路由集合
  addRoutes: [], //过滤后的异步路由
  isLivePage: false // 是否是直播页面
};
function createTree(pNode: any, allNodes: any) {
  allNodes.forEach(async (e: any) => {
    if (e.pId === pNode.auto_inc_id) {
      pNode.children.push(e);
      // 重定向第一个子路由
      if (!pNode.redirect) pNode.redirect = `/${pNode.menuPath}/${e.menuPath}`;
      e.path = e.menuPath;
      e.meta = { title: e.menuName, icon: e.menuIcon };
      if (e.isLeaf === 0) {
        e.component = Layout;
        createTree(e, allNodes);
      } else {
        // 动态引入路由 需要使用到 modules 模块 需要使用相对路径不能用 @
        e.component = modules[`../../views/${pNode.menuPath}/${e.filePath}.vue`];
      }
    }
  });
}
const actions = {
  generateRoutes({ commit }: ObjTy, roles: Array<string>) {
    return new Promise((resolve) => {
      // let accessedRoutes
      // if (settings.permissionMode === 'roles') {
      //   //filter by role
      //   if (roles.includes('admin')) {
      //     accessedRoutes = asyncRoutes || []
      //   } else {
      //     accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      //   }
      // } else {
      //   //filter by codeArr
      //   //req code arr
      //   let codeArr: any = localStorage.getItem('codeArr')
      //   if (codeArr) {
      //     codeArr = JSON.parse(codeArr)
      //   } else {
      //     localStorage.setItem('codeArr', JSON.stringify([1]))
      //     codeArr = localStorage.getItem('codeArr')
      //   }
      //   accessedRoutes = await filterRouterByCodeArr(codeArr, asyncRoutes)
      // }
      // commit('M_routes', accessedRoutes)
      // resolve(accessedRoutes)
      // 后台下发路由
      console.log('roles', roles);
      getMenuReq({ rids: roles }).then((res: any) => {
        if (res.iRet === 0) {
          // 手动添加详情页面路由
          const detailRoute = {
            auto_inc_id: 99,
            pId: 1,
            menuName: '直播详情',
            menuPath: 'live-monitor',
            menuIcon: 'table',
            isLeaf: 1,
            filePath: 'liveMonitor',
            IsValid: 1,
            sort: 1,
            hidden: true
          };
          res.data.push(detailRoute);
          const allNodes = JSON.parse(JSON.stringify(res.data));
          let pNode = res.data.filter((e: any) => {
            if (e.pId === 0) {
              return e;
            }
          });

          pNode.forEach((e: any) => {
            e.children = [];
            e.component = Layout;
            e.path = `/${e.menuPath}`;
            e.meta = { title: e.menuName, icon: e.menuIcon };
            createTree(e, allNodes);
          });
          commit('M_routes', pNode);
          resolve(pNode);
        }
      });
    });
  }
};

const mutations = {
  M_routes: (state: PermissionTy, routes: RouterTy) => {
    state.addRoutes = routes;
    state.routes = constantRoutes.concat(routes);
  },
  M_isGetUserInfo: (state: PermissionTy, data: boolean) => {
    state.isGetUserInfo = data;
  },
  M_isLivePage: (state: PermissionTy, data: boolean) => {
    state.isLivePage = data;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
