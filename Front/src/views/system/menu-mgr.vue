<template>
  <!-- 菜单管理 -->
  <div>
    <div class="opr-btn">
      <el-button type="text" @click="getMenu">
        <img
          style="width: 12px; height: 12px; margin-right: 4px"
          src="@/assets/images/refresh.png"
        />
        刷新
      </el-button>
    </div>
    <el-tabs type="border-card" class="parent-pane-padding">
      <el-tab-pane label="菜单管理"></el-tab-pane>
      <el-button type="primary" @click="openDialog('add', 'main')"
        >新建主类菜单</el-button
      >
      <div>
        <el-row style="height: calc(100vh - 170px); overflow: auto">
          <el-col :span="12">
            <el-tree
              :data="dataSource"
              node-key="auto_inc_id"
              default-expand-all
              :expand-on-click-node="false"
            >
              <template #default="{ data }">
                <div style="flex: 1; display: flex; align-items: center">
                  <span style="flex: 1" class="menu-text">{{ data.menuName }}</span>
                  <span style="color: #d39a63">
                    <a
                      @click="openDialog('edit', data)"
                      style="margin-right: 10px"
                      title="编辑菜单"
                    >
                      <el-icon>
                        <Edit />
                      </el-icon>
                    </a>
                    <a
                      @click="openDialog('add', data)"
                      style="margin-right: 10px"
                      v-if="data.isLeaf === 0"
                      title="添加子菜单"
                    >
                      <el-icon>
                        <plus />
                      </el-icon>
                    </a>
                    <a @click="remove(data)" title="移除">
                      <el-icon>
                        <delete />
                      </el-icon>
                    </a>
                  </span>
                </div>
              </template>
            </el-tree>
          </el-col>
        </el-row>
      </div>
      <MenuPop ref="menuPop" @finish="getMenu" />
    </el-tabs>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import MenuPop from "./components/menuPop.vue";
import { getMenuReq, delMenuReq } from "@/api/user";
import { Plus, Delete, Edit, Refresh } from "@element-plus/icons";
import { ElMessageBox, ElMessage } from "element-plus";
export default defineComponent({
  data() {
    return {
      dataSource: [],
    };
  },
  created() {
    this.getMenu();
  },
  methods: {
    async getMenu() {
      let data = {};
      let res = await getMenuReq(data);
      if (res.iRet === 0) {
        let allNodes = JSON.parse(JSON.stringify(res.data));
        let pNode = res.data.filter((e: any) => {
          if (e.pId === 0) {
            return e;
          }
        });
        pNode.forEach((e: any) => {
          e.children = [];
          this.createTree(e, allNodes);
        });
        this.dataSource = pNode;
      }
    },
    createTree(pNode: any, allNodes: any) {
      allNodes.forEach((e: any) => {
        if (e.pId === pNode.auto_inc_id) {
          pNode.children.push(e);
          if (e.isLeaf === 0) {
            this.createTree(e, allNodes);
          }
        }
      });
    },
    remove(node: any) {
      ElMessageBox.confirm(`确认要删除【${node.menuName}】菜单`, "提示", {
        dangerouslyUseHTMLString: true,
        customClass: "messageBox_class",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          let res = await delMenuReq(node);
          if (res.iRet === 0) {
            ElMessage.success("删除成功");
            this.getMenu();
          }
        })
        .catch(() => {
          // catch error
        });
    },
    openDialog(type: any, node: any) {
      (this.$refs["menuPop"] as any).openMenu = true;
      (this.$refs["menuPop"] as any).type = type;
      if (node === "main") {
        (this.$refs["menuPop"] as any).type = node;
      } else if (type === "edit") {
        (this.$refs["menuPop"] as any).formData = node;
      } else {
        (this.$refs["menuPop"] as any).formData.pId = node.auto_inc_id;
      }
    },
  },
  components: {
    Plus,
    Delete,
    Edit,
    Refresh,
    MenuPop,
  },
});
</script>

<style lang="scss" scoped>
.night .menu-text {
  color: #fff;
}
.night .custom-tree-node {
  display: flex;
  span {
    &:nth-child(1) {
      flex: 1;
    }
  }
}
</style>
