import { loginReq, logoutReq, getInfoReq, getRoleReq, queryWupUrl,getDeptList } from '@/api/user';
import { setToken, removeToken } from '@/utils/auth';
import { ObjTy } from '@/types/common';
import { UserTy } from '@/types/store';
import { getSubDepartments } from "@/utils/validate";
//token: getToken(),

const getDefaultState = () => {
  return {
    //token: getToken(),
    yzmid: '',
    userid: '',
    username: '',
    avatar: '',
    roles: [],
    userOrg: '',
    userDept: '',
    userMgrType: '',
    wupUrl: '',
    comName: '',
    userType: '',
    isEditor: false,
    isAuditor: false,
    departId: '', // 当前用户所属公司
    userList: [], // 当前用户可查看的用户列表
    checkedDept: '1', // 默认选中公司 超管可用 已废弃
    // mgrType:'' , // 当前账户类型
	accessDeptIds:[], 
	accessDeptList:[],
  };
};

const state = getDefaultState();

const mutations = {
  M_SET_yzmid: (state: UserTy, yzmid: string) => {
    console.log('M_SET_yzmid ====> ', yzmid);
    state.yzmid = yzmid;
  },
  M_userid: (state: UserTy, userid: string) => {
    state.userid = userid;
  },
  M_username: (state: UserTy, username: string) => {
    state.username = username;
  },
  M_roles: (state: UserTy, roles: Array<string>) => {
    state.roles = roles;
  },
  M_userorg: (state: UserTy, orgid: string) => {
    state.userOrg = orgid;
  },
  M_userdept: (state: UserTy, depid: string) => {
    state.userDept = depid;
  },
  M_usermgrtype: (state: UserTy, mgrtype: string) => {
    state.userMgrType = mgrtype;
  },
  M_SET_WUP_URL: (state: any, url: string) => {
    state.wupUrl = url;
  },

  M_SET_COM_NAME: (state: any, name: string) => {
    state.comName = name;
  },
  M_userType: (state: UserTy, userType: string) => {
    state.userType = userType;
    if (userType === 'A') {
      state.isEditor = true;
      state.isAuditor = true;
    } else if (userType === 'B') {
      state.isEditor = true;
      state.isAuditor = false;
    } else if (userType === 'C') {
      state.isEditor = false;
      state.isAuditor = true;
    } else {
      state.isEditor = false;
      state.isAuditor = false;
    }
  },
  M_departId: (state: UserTy, departId: string) => {
    state.departId = departId;
  },
  M_userList: (state: UserTy, userList: Array<string>) => {
    state.userList = userList || [];
	console.log('仓库内userList', state.userList)
  },
  // 全局切换所选公司 （只有超管可用）
  M_SET_CHECKED_DEPT: (state: UserTy, deptId: string) => {
    state.checkedDept = deptId;
  }, 
};
const actions = {
  // user login
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login({ commit }: ObjTy, data: ObjTy) {
    return new Promise((resolve, reject) => {
      loginReq(data)
        .then((res: ObjTy) => {
          if (res.iRet === 0) {
            //commit('SET_Token', res.data?.jwtToken)
			console.log('login 更新token');
            setToken(res.token);
            resolve(null);
          } else {
            reject(res);
          }
        })
        .catch((error: any) => {
          reject(error);
        });
      // setToken('admin')
      // resolve(null)
    });
  },
  // get user info
  getInfo({ commit }: ObjTy) {
    return new Promise((resolve, reject) => {
      getInfoReq()
        .then((response: ObjTy) => {
          const { data } = response;
          console.log(' data ====> ', data);
          // debugger;

          if (!data) {
            return reject('Verification failed, please Login again.');
          }

          let roles = [];

          if (data.mgrType === 'S') {
            roles = ['admin'];
          } else {
            roles = [JSON.parse(data.rIds)];
          }

          // //此处模拟数据
          // const rolesArr: any = localStorage.getItem('roles')
          // if (rolesArr) {
          //   data.roles = JSON.parse(rolesArr)
          // } else {
          //   data.roles = ['admin']
          //   localStorage.setItem('roles', JSON.stringify(data.roles))
          // }

          // const { roles, username } = data
          data.roles = roles;
          commit('M_userid', data.uid);
          commit('M_username', data.realName);
          commit('M_roles', roles);
          commit('M_userorg', data.orgId);
          commit('M_userdept', data.departId);
          commit('M_usermgrtype', data.mgrType);
          commit('M_userType', data.userType);
          commit('M_departId', data.departId); // 所属公司
          commit('M_userList', data.userList); // 用户权限
		
          // commit('SET_AVATAR', avatar)
          console.log('仓库内用户信息：', state);
          resolve(data);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  },
  getRoleInfo({ commit }: ObjTy, roles: Array<string>) {
    return new Promise((resolve, reject) => {
      // 如果是超级管理员，则拥有所有权限
      if (roles.includes('admin')) {
        // commit('M_departId', '0'); // 所属公司
        // commit('M_userList', ['admin']); // 用户权限
        // commit('M_userType', 'A'); // 用户类型
      } else {
        getRoleReq({ auto_inc_id: roles[0] })
          .then((response: ObjTy) => {
            const { data } = response;
            // debugger;

            if (!data) {
              return reject('getRoleReq failed, please Login again.');
            }
            console.log('仓库内角色：', data);
            // commit('M_departId', data[0].departId); // 所属公司
            // commit('M_userList', data[0].userList); // 用户权限
            // commit('SET_AVATAR', avatar)

            resolve(data[0]);
          })
          .catch((error: any) => {
            reject(error);
          });
      }
    });
  },
  // user logout
  logout({ commit }: ObjTy) {
    return new Promise((resolve, reject) => {
      logoutReq()
        .then(() => {
          removeToken(); // must remove  token  first
          // resetRouter()
          resolve(null);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  },
  // user logout
  getWupUrl({ commit }: any) {
    return new Promise((resolve, reject) => {
      queryWupUrl()
        .then((response: any) => {
          if (response.iRet === 0) {
            commit('M_SET_WUP_URL', response.data.wupUrl);
            commit('M_SET_COM_NAME', response.data.comName);
          }
          resolve(response);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  },
  // remove token
  resetToken() {
    return new Promise((resolve) => {
      removeToken(); // must remove  token  first
      resolve(null);
    });
  },
 
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
