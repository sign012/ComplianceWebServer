<template>
  <div class="dashboard-container">
    <div>
      <el-row :gutter="10">
        <!-- 登录信息 -->
        <el-col :span="6">
          <el-card shadow="always" class="box">
            <div>
              <div class="login-record">
                <div class="pic"></div>
                <div class="info">
                  <div>最后一次登录记录</div>
                  <div>
                    ip:
                    <span></span>
                  </div>
                  <div>
                    地点:
                    <span></span>
                  </div>
                </div>
                <div class="more">
                  查看更多
                  <el-icon class="el-icon-plus"></el-icon>
                </div>
              </div>
            </div>
            <div class="common-function">
              <span>常用快捷</span>
              <div>
                <el-tag v-for="item in items" :key="item.label" effect="plain" style="font-size: 14px; cursor: pointer">
                  {{ item.label }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
        <!-- 我的账户 -->
        <el-col :span="12">
          <el-card shadow="always">
            <template #header>
              <span>我的账户</span>
            </template>
          </el-card>
        </el-col>
        <!-- 我的消息 -->
        <el-col :span="6">
          <el-card shadow="always">
            <template #header>
              <span>我的消息</span>
            </template>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="10" class="cards">
        <el-col :span="18">
          <el-card shadow="always">
            <template #header>
              <span>资产收益分析</span>
            </template>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="always">
            <template #header>
              <span>交易员收益排行</span>
            </template>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';

let store = useStore();
let items = [{ label: '测试' }];
const username = computed(() => {
  return store.state.user.username;
});
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    .cards {
      margin-top: 10px;
    }
    .box {
      .login-record {
        display: flex;
        align-items: center;
        .pic {
          width: 64px;
          height: 64px;
          background: #000;
          border-radius: 50%;
          margin-right: 20px;
        }
        .info {
          color: #666;
          flex: 1;
        }
        .more {
          font-size: 12px;
          color: orange;
        }
      }
      .common-function {
        margin-top: 10px;
        border-top: 1px solid #eee;
      }
    }
  }
}
</style>
