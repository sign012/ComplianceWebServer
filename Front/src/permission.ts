import router, { asyncRoutes } from '@/router';
import store from './store';
import settings from './settings';
import { getToken, removeToken } from '@/utils/auth';
import NProgress from 'nprogress';
NProgress.configure({ showSpinner: false }); // NProgress Configuration
import 'nprogress/nprogress.css';
import getPageTitle from '@/utils/getPageTitle';
import { RouterRowTy } from '@/types/router';
import { access } from 'fs';

const whiteList = ['/login']; // no redirect whitelist
router.beforeEach(async (to: any, from, next: any) => {
  // start progress bar
  if (settings.isNeedNprogress) NProgress.start();
  // set page title
  document.title = getPageTitle(to.meta.title);
  /*
   * 总的来说：过滤动态路由
   * 1.是否有token ,有token 如果要去登录页则重定向到首页。没有token, 重新定向到登录页
   * 2.判断是否权限筛选,是,直接放行。没有，筛选动态路由后，添加动态路由然后放行，
   * */
  // 判断是否有wupUrl
  if (store.state.user.wupUrl == '') {
    store.dispatch('user/getWupUrl');
  }
  const hasToken: string = settings.isNeedLogin ? getToken() : 'temp_token';
  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' });
    } else {
      //是否获取过用户信息
      let isGetUserInfo: boolean = store.state.permission.isGetUserInfo;
      if (isGetUserInfo) {
        next();
        // next({ ...to, replace: true });
      } else {
		// console.log('未获取过用户信息');
        try {
          let accessRoutes = [];
          if (settings.isNeedLogin) {
            // get user info
            // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']

            const { roles } = await store.dispatch('user/getInfo');
            store.dispatch('user/getRoleInfo', roles); // 新增需求 通过角色请求对应所属公司和用户权限
            // let userroles =  ['admin']
            accessRoutes = await store.dispatch('permission/generateRoutes', roles);
          } else {
            accessRoutes = asyncRoutes;
            store.commit('permission/M_routes', accessRoutes);
          }
          // dynamically add accessible routes
          //router4 addRoutes destroyed

          accessRoutes.forEach((route: RouterRowTy) => {
            router.addRoute(route);
          });

          //already get userInfo
          store.dispatch('tagsView/delAllViews');
          store.commit('permission/M_isGetUserInfo', true);
          if (to.path === '/oper-review') {
            //第一次进入时 跳转拥有权限的第一个路由
            const firstRouter = accessRoutes[0];
            next({ path: `${firstRouter.path}/${firstRouter.children[0].path}`, replace: true });
          } else {
            // console.log(accessRoutes, to);
            let allPath: any = [];
            accessRoutes.forEach((item: any) => {
              let parentPath = item.path;
              item.children.forEach((v: any) => {
                let wholePath = `${parentPath}/${v.path}`;
                allPath.push(wholePath);
              });
            });
            if (!allPath.includes(to.fullPath) && to.path !== '/oper-review/live-monitor') {
              // 解决监控页刷新
              removeToken();
              next(`/login`);
              return;
            }
            // 如果进入直播监控，改变相关ui布局 旧版详情页代码
            // if (to.path === '/live-monitor') {
            //   store.commit('permission/M_isLivePage', true);
            // } else {
            //   store.commit('permission/M_isLivePage', false);
            // }
            next({ ...to, replace: true });
          }
        } catch (err) {
          await store.dispatch('user/resetToken');
          next(`/login`);
          if (settings.isNeedNprogress) NProgress.done();
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
    //   console.log('没有token 并且在白名单中 放行');
      next();
    } else {
    //   console.log('没有token 并且不在白名单中 重定向到登录页');
      next(`/login`);
      // next();
      if (settings.isNeedNprogress) NProgress.done();
    }
  }
});

router.afterEach(() => {
  if (settings.isNeedNprogress) NProgress.done();
});
