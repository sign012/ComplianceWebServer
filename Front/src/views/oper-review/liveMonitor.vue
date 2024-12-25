<template>
  <!-- 直播详情页  flv兼容版本 -->
  <div class="live-monitor">
    <div class="page-top">
      <el-button color="#3A62F7" @click="back">
        <template #default>
          <div style="display: flex; align-items: center">
            <img src="@/assets/images/arrow-left.png" alt="" />
            <span style="margin-left: 10px">返回</span>
          </div>
        </template>
      </el-button>
      <div class="item">
        <img :src="detailInfo.avatar_url" alt="" />
        {{ detailInfo.nickname }}
        <span class="plate">
          <img
            src="@/assets/images/hall-ypkt.png"
            alt=""
            v-if="detailInfo.live_platform === 0"
          />
          <img
            src="@/assets/images/hall-sph.png"
            alt=""
            v-if="detailInfo.live_platform === 1"
          />
          <img
            src="@/assets/images/hall-dy.png"
            alt=""
            v-if="detailInfo.live_platform === 2"
          />
          <img
            src="@/assets/images/hall-xet.png"
            alt=""
            v-if="detailInfo.live_platform === 3"
          />
          <img
            src="@/assets/images/hall-ths.png"
            alt=""
            v-if="detailInfo.live_platform === 4"
          />
          <img
            src="@/assets/images/hall-ks.png"
            alt=""
            v-if="detailInfo.live_platform === 5"
          />
          {{ plateformDict[detailInfo.live_platform] }}
        </span>
      </div>
      <div class="item live_title">
        <div class="center">
          <span class="title">
            <img src="@/assets/images/play_logo.png" alt="" />
            直播标题
          </span>
          <p>
            {{ detailInfo.live_title }}
          </p>
        </div>
      </div>
      <div class="item">
        <span class="duration">{{ detailInfo.duration }}</span>
        <span class="duration"
          >直播场次：{{ detailInfo.start_time_str }}~{{ detailInfo.end_time_str }}</span
        >
      </div>
      <el-popover placement="bottom-start" trigger="click">
        <template #reference><el-button color="#3a62f7">...</el-button></template>
        <template #default>
          <div class="popover-content">
            <div title="下载" @click="downloadVideo" class="text-decorate">
              下载直播视频
            </div>
            <div title="导出">
              <vue3-json-excel
                :json-data="list"
                :fields="jsonFields"
                class="export-btn"
                type="xls"
                :header="excelheader"
                :name="excelname"
                footer
              >
                <div @click="exportResult" class="text-decorate">导出审核结果</div>
              </vue3-json-excel>
            </div>
            <!-- <div title="重审" @click="reAudit">重审本场内容</div> -->
          </div>
        </template>
      </el-popover>
    </div>
    <div class="live-container">
      <!-- 报备信息 -->
      <div
        class="row bbxx"
        v-if="
          Object.values(detailInfo.report_info).some(
            (item) => item !== '' && item !== null && item !== 0 && item.length > 0
          )
        "
      >
        <h2>报备信息</h2>
        <div>
          <div class="item">
            <span class="label">报备标题：</span>
            <span class="value">{{ detailInfo.report_info.live_title || "--" }}</span>
          </div>
          <div class="item">
            <span class="label">报备时段：</span>
            <span class="value">{{ detailInfo.report_duration || "--" }}</span>
          </div>
          <div class="item">
            <span class="label">报备材料：</span>

            <el-popover
              placement="bottom-start"
              title=""
              :width="200"
              trigger="hover"
              v-if="detailInfo.report_info.live_script_files"
            >
              <template #reference>
                <div class="value-list" @click="downloadVideo" title="点击下载">
                  <span class="value">
                    {{
                      detailInfo.report_info.live_script_files
                        ? detailInfo.report_info.live_script_files[0]
                        : "--"
                    }}
                  </span>
                </div>
              </template>
              <template #default>
                <div
                  class="value-list"
                  v-for="(item, index) in detailInfo.report_info.live_script_files"
                  :key="index"
                >
                  <span class="value">{{ item }}</span>
                </div>
              </template>
            </el-popover>
            <span class="value" v-else>--</span>
          </div>
        </div>
        <div>
          <div class="item">
            <span class="label">报备内容：</span>
            <span class="value">{{ detailInfo.report_info.live_content || "--" }}</span>
          </div>
        </div>
      </div>
      <!-- 直播视频 -->
      <div class="row">
        <h2>直播视频</h2>
        <div style="display: flex; justify-content: space-between">
          <div class="video no-video" v-if="storing == 1">
            <h1>直播已结束</h1>
            <p>视频录制存储中，稍后支持回看</p>
          </div>
          <div class="video" v-else-if="videoType === 'hls'">
            <vue3VideoPlay v-bind="videoOptions" id="videoPlayer" />
          </div>
          <div class="video" v-else-if="videoType === 'flv'">
            <video
              ref="videoRef"
              controls
              style="width: 100%; height: 316px; background-color: #000"
              @seeked="handleSeeked"
              autoplay
            ></video>
          </div>
          <div v-else>暂无数据</div>
          <div class="translate">
            <div class="title">
              语音识别
              <div class="search">
                <!-- 查找关键字，限制字数不大于12个，并且实时显示 -->
                <el-input
                  v-model="searchText"
                  placeholder="请输入关键字"
                  maxlength="12"
                  clearable
                  @input="search"
                >
                  <template #prefix>
                    <el-icon>
                      <Search />
                    </el-icon>
                  </template>
                  <template #append>
                    <div class="search-append">
                      <span class="search-count">{{
                        currentIndex + "/" + searchResults.length
                      }}</span>
                      <span
                        class="up-down-btn"
                        @click="focusPrevious"
                        :class="{ disabled: currentIndex === 0 || currentIndex === 1 }"
                      >
                        <el-icon><ArrowUp /></el-icon>
                      </span>
                      <span
                        class="up-down-btn"
                        @click="focusNext"
                        :class="{
                          disabled:
                            currentIndex === searchResults.length || currentIndex === 0,
                        }"
                      >
                        <el-icon><ArrowDown /></el-icon>
                      </span>
                    </div>
                  </template>
                </el-input>
                <el-button @click="focusNext" color="#3a62f7">搜索</el-button>
              </div>
            </div>
            <div style="display: flex">
              <ul
                ref="scrollContainer"
                class="infinite-list"
                style="overflow: auto"
                id="scrollableDiv"
              >
                <div
                  id="content"
                  class="content"
                  v-if="liveInfo.transContent"
                  v-html="liveInfo.transContent_light"
                ></div>
                <div v-else>暂无数据</div>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <!-- 疑似违规内容 -->

      <div class="row yswg">
        <h2>疑似违规内容</h2>
        <div class="violation">
          <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
            <el-tab-pane
              v-for="(item, index) in tabList"
              :key="index"
              :label="item.label + '  (' + item.count + ')'"
              :name="item.name"
            ></el-tab-pane>
          </el-tabs>
          <el-button color="#3a62f7" class="audit-btn" @click="toAudit()" v-if="isAuditor"
            >批量审核</el-button
          >
          <div class="violation-table">
            <div class="t_header">
              <div class="check-box">
                <el-checkbox
                  v-model="allChecked"
                  label=" "
                  @change="selectAll"
                  :disabled="!allcanChecked"
                ></el-checkbox>
              </div>
              <div class="t_header_list">
                <div
                  class="t_header_item cell"
                  v-for="(item, index) in tHeaderList"
                  :key="index"
                  :style="{ width: item.width }"
                >
                  {{ item.name }}
                </div>
              </div>
            </div>
            <div class="t_body">
              <div
                class="t_body_row"
                v-for="(item, index) in filterViolationListByType"
                :key="index"
                :class="{ isExpand: expends[item.id], isDisabled: !item.canChecked }"
              >
                <div class="check-box-1">
                  <el-checkbox
                    v-model="selectObj[item.id]"
                    label=""
                    @change="selectPRow($event, item.id)"
                    :disabled="!item.canChecked"
                  ></el-checkbox>
                </div>
                <div class="row-title">
                  <div class="title">
                    <!-- 点击按钮展开子表 -->
                    <span
                      class="expand"
                      @click="expand(item.id, false)"
                      v-show="expends[item.id]"
                    >
                      <el-icon><ArrowDown /></el-icon>
                    </span>
                    <span
                      class="expand"
                      @click="expand(item.id, true)"
                      v-show="!expends[item.id]"
                    >
                      <el-icon><ArrowRight /></el-icon>
                    </span>
                    <span>{{ item.label }}({{ item.count }})</span>
                  </div>
                  <div class="t_body_child" v-show="expends[item.id]">
                    <div
                      class="t_body_child_row"
                      v-for="(child, index) in item.children"
                      :key="index"
                      :class="{ isDisabled: child.status !== 0 }"
                    >
                      <div class="check-box-2">
                        <el-checkbox
                          v-model="selectObj[child.id]"
                          label=""
                          @change="selectCRow($event, child.id)"
                          :disabled="child.status !== 0"
                        ></el-checkbox>
                      </div>
                      <div
                        class="t_body_child_list"
                        v-for="(childKey, childIndex) in tHeaderList"
                        :key="childIndex"
                        :style="{
                          width: childKey.width,
                          marginLeft: childIndex === 0 ? '20px' : '',
                        }"
                      >
                        <div class="cell">
                          <div v-if="childKey.type == 'status'">
                            <div
                              :style="{ color: auditVioStatusColorDict[child.status] }"
                            >
                              {{ auditVioStatusDict[child.status] }}
                            </div>
                          </div>
                          <div v-else-if="childKey.type == 'labels'">
                            <el-popover
                              placement="top-start"
                              title=""
                              :width="200"
                              trigger="hover"
                              :hide-after="0"
                              disabled
                            >
                              <template #reference>
                                <div class="wrap3">
                                  <!-- <span class="tag" v-for="(items, indexs) in child.labels.slice(0, 1)" :key="indexs">
                                    {{
                                      (items.label.length > 3 ? violationDict[items.label.slice(0, 3)] + '-' : '') +
                                      violationDict[items.label]
                                    }}
                                    {{ child.labels.length > 1 ? '...' : '' }}
                                  </span> -->
                                  <span class="tag">
                                    {{ child.labels_str }}
                                  </span>
                                </div>
                              </template>
                              <template #default>
                                <div class="popover-content">
                                  {{ child.labels_str }}
                                  <!-- 谩骂-不文明用语;谩骂-不文明用语;谩骂-不文明用语;谩骂-不文明用语;谩骂-不文明用语;谩骂-不文明用语 -->
                                </div>
                              </template>
                            </el-popover>
                          </div>
                          <div v-else-if="childKey.type == 'content'">
                            <el-popover
                              placement="top-start"
                              title=""
                              :width="childKey.width"
                              trigger="hover"
                              :hide-after="0"
                            >
                              <template #reference>
                                <div>
                                  <div
                                    class="content-cell"
                                    v-html="child.content_html"
                                    :style="{ width: childKey.width }"
                                  ></div>
                                  <div v-if="child.image_url" style="height: 54px">
                                    <!-- <img :src="child.image_url" style="width: 100%; height: 100%" /> -->
                                    <div
                                      @click="openImagePreview"
                                      class="look-image"
                                      title="点击查看图片"
                                    >
                                      [截帧图片]
                                    </div>
                                    <el-image
                                      ref="image"
                                      src=""
                                      :preview-src-list="[child.image_url]"
                                      :initial-index="0"
                                    >
                                      <template #error>
                                        <span style="display: none"></span>
                                      </template>
                                    </el-image>
                                  </div>
                                </div>
                              </template>
                              <template #default>
                                <div class="popover-content" v-if="child.image_url">
                                  点击查看图片
                                </div>
                                <div class="popover-content" v-else>
                                  {{ child.content }}
                                </div>
                              </template>
                            </el-popover>
                          </div>
                          <div v-else-if="childKey.type == 'oper'">
                            <el-button
                              type="text"
                              @click="toAudit(child.id)"
                              v-if="child.status === 0"
                              style="
                                color: rgb(58, 98, 247);
                                border: 1px solid rgb(58, 98, 247);
                                background-color: transparent;
                                margin-right: 10px;
                              "
                            >
                              审核
                            </el-button>
                          </div>

                          <div
                            v-else-if="
                              childKey.type == 'reason' || childKey.type == 'role_name'
                            "
                          >
                            <el-popover
                              placement="top-start"
                              title=""
                              trigger="hover"
                              :hide-after="0"
                            >
                              <template #reference>
                                <div>
                                  {{
                                    child[childKey.type]
                                      ? child[childKey.type].slice(0, 9)
                                      : ""
                                  }}
                                </div>
                              </template>
                              <template #default>
                                <div>
                                  {{ child[childKey.type] }}
                                </div>
                              </template>
                            </el-popover>
                          </div>

                          <div v-else>
                            {{ child[childKey.type] }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <AuditPop ref="AuditPopRef" :auditList="auditList" @renderList="renderList" />
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  onUnmounted,
  ref,
  watch,
  computed,
  nextTick,
  getCurrentInstance,
} from "vue";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import {
  queryLiveContent,
  queryLiveViolation,
  auditLiveViolation,
  queryUnionLiveInfoByIds,
  queryLiveReport,
  queryCustomizeLabelInfo,
} from "@/api/runCheck";
import dayjs from "dayjs";
import {
  Search,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Download,
  CircleClose,
  CircleCheck,
} from "@element-plus/icons";
// import Hls from 'hls.js';
import "vue3-video-play/dist/style.css";
import { ElMessage } from "element-plus";
import {
  formatSeconds,
  binarySearch,
  formatSqlData,
  setWordColor,
} from "@/utils/validate";
import { useRoute, useRouter } from "vue-router";
import {
  violationDict,
  plateformDict,
  auditVioStatusDict,
  auditVioStatusColorDict,
} from "@/utils/dict";
import flvjs from "flv.js";
import { useStore } from "vuex";
import AuditPop from "./components/audit-pop.vue";
export default defineComponent({
  name: "LiveConfig",
  components: {
    Search,
    ArrowLeft,
    ArrowRight,
    ArrowDown,
    ArrowUp,
    Download,
    AuditPop,
    // VideoPlayer
  },
  setup() {
    var timer = null;
    const videoRef = ref(null);
    const AuditPopRef = ref(null);
    const image = ref(null);
    const busy = ref(false);
    const lastScrollTop = ref(0);

    const route = useRoute();
    let { proxy }: any = getCurrentInstance();
    let store = useStore();
    let isProgrammaticScroll = true; //  标志变量，用于区分代码触发的滚动   true 代码触发的滚动 false 用户手动触发的滚动

    const dataMap = reactive({
      isAuditor: store.state.user.isAuditor, // 当前用户是否可以审核
      contentList: [], // 语音识别内容列表
      list: [],
      jsonFields: {},
      excelheader: "直播详情",
      excelname: "导出表格",
      selectObj: {} as any, // 所有数据的选择情况  包含大类小类
      allChecked: false,
      allcanChecked: false, // 总的选择按钮是否可用
      checked1: false,
      tHeaderList: [
        {
          name: "发现时间",
          // width: '10%',
          width: "130px",
          type: "real_time",
          position: "left",
        },
        {
          name: "疑似违规类型",
          // width: '20%',
          width: "141px",
          type: "labels",
          position: "left",
        },
        {
          name: "疑似违规内容",
          //   width: '35%',
          width: "750px",
          type: "content",
          position: "left",
        },
        {
          name: "人审结果",
          // width: '10%',
          width: "100px",
          type: "status",
          position: "center",
        },
        {
          name: "人审意见",
          // width: '15%',
          width: "150px",
          type: "reason",
          position: "center",
        },
        {
          name: "审核人",
          // width: '10%',
          width: "150px",
          type: "role_name",
          position: "center",
        },
        {
          name: "操作",
          // width: '10%',
          width: "100px",
          type: "oper",
          position: "right",
        },
      ],
      userInfo: store.state.user, // 当前用户信息
      auditVioStatusDict,
      auditVioStatusColorDict,
      activeName: "all",
      tabList: [
        { label: "全部", name: "all", count: 0 },
        { label: "待人审", name: "0", count: 0 },
        { label: "人审通过", name: "2", count: 0 },
        { label: "人审不通过", name: "1", count: 0 },
      ],
      detailInfo: {
        report_info: {} as any,
      } as any, // 直播信息Union
      videoType: "flv", // 视频类型 hls:hls/mp4   flv:flv/mp4
      videoDownLoadUrl: "", // 视频下载地址
      currentLive_status: 0, //当前直播状态
      storing: 0, // 无视频
      currentLive_id: "",
      video_start_time: 0 as number, // 视频开始时间
      violationDict,
      plateformDict,
      searchText: "",
      searchResults: [],
      currentIndex: 0,
      videoOptions: {
        width: "100%", //播放器高度
        height: "316px", //播放器高度
        color: "#409eff", //主题色
        title: "", //视频名称
        // src: 'https://cdn.jsdelivr.net/gh/xdlumia/files/video-play/IronMan.mp4', //mp4
        src: "",
        autoPlay: true,
        type: "m3u8", //视频类型
      } as any,
      videoUrl:
        "http://pull-f3.douyincdn.com/third/stream-403412210621874859_or4.m3u8?auth_key=1716950935-0-0-80872fb82632da1d6cbd6212e3c18ea9",
      zhCn,
      liveViolations: [], //违规记录 接口返回
      liveInfo: {
        transContent: "", // 翻译内容
        transContent_light: "", // 翻译内容，高亮版
        violationList: [], // 违规记录
      }, // 直播信息
      pageObj: {
        pageIndex: 0,
        pageSize: 50,
        total: 0,
      },
      defaultPageSize: 50,
      lastNumber: 1, // 最后一页的页码
      auditList: [], // 处理列表
      expends: {}, // 所有子表展开状态
      customizeList: [] as any, //自定义标签列表 无违规数据
      //   violationListByType: [] as any, // 自定义标签列表 有违规数据
      filterViolationListByType: [], // 过滤后的违规记录 按类型分组
      showBottomFlag: true, // 新内容置底
    });
    /**
     * @text  高亮文本
     * @currentIndex  定位索引 背景色 默认第一个
     */
    const lightCurrentKeyword = (
      text: any,
      currentIndex: any = 1,
      type: any = "scroll"
    ) => {
      dataMap.liveInfo.transContent_light = dataMap.liveInfo.transContent.replace(
        new RegExp(text, "gi"),
        `<span class="highlight">${text}</span>`
      );
      nextTick(() => {
        // 第定位到的关键词给特殊背景色
        const currentDom = document.querySelectorAll("span.highlight")[currentIndex - 1];

        if (currentDom) {
          currentDom.classList.add("highlight-focus");
          // 正常搜索状态下是滚动移到定位的位置，如果是直播文本更新，则不滚动，直接定位
          if (type == "scroll") {
            currentDom.scrollIntoView({ behavior: "smooth", block: "nearest" });
          } else {
            return;
          }
        }
      });
    };
    const search = () => {
      // 输入框内容变化时，重新搜索 高亮重置
      dataMap.searchResults = [];
      dataMap.currentIndex = 0;
      const elements = document.querySelectorAll("span.highlight");
      elements.forEach((element) => {
        element.classList.remove("highlight");
        element.classList.remove("highlight-focus");
      });
      const text = dataMap.searchText;
      // **  重置查询文本，清除掉span 解决2次搜索同样关键字时 在span里搜不到的问题 **
      dataMap.liveInfo.transContent_light = JSON.parse(
        JSON.stringify(dataMap.liveInfo.transContent)
      );
      // 搜索空时，重置记录的文本和索引
      if (!text) {
        sessionStorage.setItem("searchText", "");
        sessionStorage.setItem("searchIndex", "0");
        return;
      }
      // ** 解决搜索到html标签
      // 创建一个虚拟的 div 元素来解析 HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(dataMap.liveInfo.transContent, "text/html");

      // 提取文本内容
      const textContent = doc.body.textContent as any;

      const regex = new RegExp(text, "gi");
      const matches = textContent.matchAll(regex);
      dataMap.searchResults = [...matches].map((match, index) => ({
        text: match[0],
        index: index + 1, // 索引从1开始，如果需要从0开始，可以去掉+1
      }));
      // 高亮当前关键字
      if (dataMap.searchResults.length > 0) {
        dataMap.currentIndex = 1; // 索引从1开始，如果需要从0开始，可以去掉+1
        lightCurrentKeyword(text);
        // 记录此次搜索的关键字 用于直播中保留搜索定位
        sessionStorage.setItem("searchText", text);
        sessionStorage.setItem("searchIndex", String(dataMap.currentIndex));
      } else {
        dataMap.currentIndex = 0; // 索引从1开始，如果需要从0开始，可以去掉+1
      }
    };
    const focusNext = () => {
      if (
        dataMap.searchResults.length > 0 &&
        dataMap.currentIndex < dataMap.searchResults.length
      ) {
        dataMap.currentIndex++;
        sessionStorage.setItem("searchIndex", String(dataMap.currentIndex)); // 当前搜索定位到的索引
        const highlights = document.querySelectorAll(" .highlight");
        const element_old = document.querySelector(` .highlight-focus`);
        if (highlights.length >= dataMap.currentIndex) {
          // 获取第currentIndex个highlight元素
          const element = highlights[dataMap.currentIndex - 1];
          if (element) {
            if (element_old) {
              element_old.classList.remove("highlight-focus");
            }
            element.classList.add("highlight-focus");
            element.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }
      }
    };
    const focusPrevious = () => {
      if (dataMap.searchResults.length > 0 && dataMap.currentIndex > 1) {
        dataMap.currentIndex--;
        const highlights = document.querySelectorAll(" .highlight");
        const element_old = document.querySelector(` .highlight-focus`);
        if (highlights.length >= dataMap.currentIndex) {
          // 获取第currentIndex个highlight元素
          const element = highlights[dataMap.currentIndex - 1];
          if (element) {
            if (element_old) {
              element_old.classList.remove("highlight-focus");
            }
            element.classList.add("highlight-focus");
            element.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }
      }
    };

    const getUnionLiveInfoByIds = async (id: any) => {
      let params = {
        ids: [id],
      };
      let resData = await queryUnionLiveInfoByIds(params);
      if (resData.ret === 0) {
        let preText = "直播时长：";
        if (dataMap.currentLive_status == 0) {
          let obj = resData.data.live_infos[0]?.live_current || {};

          // 直播中
          if (obj.stream_url) {
            obj.end_time = undefined;
            preText = "已直播：";
          }
          dataMap.detailInfo = {
            ...obj,
            duration: preText + formatSeconds(obj.start_time, obj.end_time),
            start_time_str: dayjs(obj.start_time * 1000).format("MM-DD HH:mm:ss"),
            end_time_str: obj.end_time
              ? dayjs(obj.end_time * 1000).format("MM-DD HH:mm:ss")
              : "正在直播",
            report_duration:
              dayjs(obj.report_info.start_time * 1000).format("MM/DD") +
              dayjs(obj.report_info.start_time * 1000).format("HH:mm:ss") +
              "~" +
              dayjs(obj.report_info.end_time * 1000).format("HH:mm:ss"),
          };
        } else if (dataMap.currentLive_status == 1) {
          let obj = resData.data.live_infos[0]?.live_history || {};
          let _info = {
            ...obj,
            duration: preText + formatSeconds(obj.start_time, obj.end_time),
            start_time_str: dayjs(obj.start_time * 1000).format("MM-DD HH:mm:ss"),
            end_time_str: dayjs(obj.end_time * 1000).format("MM-DD HH:mm:ss"),
            report_info: {},
          };
          // 历史查报备

          // 如果无报备id  则显示空
          if (_info.report_id == null || !_info.report_id) {
            dataMap.detailInfo = _info;
            dataMap.detailInfo.report_info = {};
          } else {
            let res_report = await queryLiveReport({
              id: _info.report_id,
            });
            if (res_report.ret == 0) {
              _info.report_info = res_report.data.live_reports[0];
              _info.report_duration =
                dayjs(_info.report_info.start_time * 1000).format("MM/DD") +
                "  " +
                dayjs(_info.report_info.start_time * 1000).format("HH:mm:ss") +
                "~" +
                dayjs(_info.report_info.end_time * 1000).format("HH:mm:ss");
              dataMap.detailInfo = _info;
            }
          }
        }
      }
    };
    const fillContent = (contents: any) => {
      let transContent = ``;
      contents.forEach((item) => {
        transContent += `<div class="content-item" >
          <div class="time" >${dayjs(item.real_time * 1000).format("HH:mm:ss")}</div>
          <div class="content-txt">${item.content}</div>
          </div>`;
      });
    };
    const fillTransContent = (data: any, type = "normal") => {
      // 给最后一条数据透明底色
      if (type == "last") {
        return `<div class="content-item content-last" >
          <div class="time" >${
            data.real_time > 0 ? dayjs(data.real_time * 1000).format("HH:mm:ss") : "--"
          }</div>
          <div class="content-txt " >${data.content || "--"}</div>
          </div>`;
      } else {
        return `<div class="content-item" >
          <div class="time" >${
            data.real_time > 0 ? dayjs(data.real_time * 1000).format("HH:mm:ss") : "--"
          }</div>
          <div class="content-txt" >${data.content || "--"}</div>
          </div>`;
      }
    };

    //【任意状态下】type init 首次进入，先加载第一页和最后一页，再从第二页开始加载所有的。一页页填充。加载完毕后，提示历史识别已加载完毕。
    //【仅直播中】 type interval 加载最新一页，并将新数据插入到最后一页
    const getLiveContent = async (id: string, type = "init") => {
      if (type === "init") {
        let params = {
          id: id,
          pageIndex: 0,
          pageSize: dataMap.defaultPageSize,
          type: dataMap.currentLive_status,
        };
        let res = await queryLiveContent(params);
        // 获取总页数
        if (res.ret == 0) {
          dataMap.pageObj.total = res.data.total_count;

          if (res.data.total_count > dataMap.defaultPageSize) {
            dataMap.lastNumber = Math.ceil(
              res.data.total_count / dataMap.defaultPageSize
            );
          }

          // 语音识别列表发生变化，更新翻译内容
          //   changeTransContent(dataMap.contentList);
          //   console.log("dataMap.lastNumber===>", dataMap.lastNumber);
          if (dataMap.lastNumber > 1) {
            // 先加载最后一页，然后从第一页开始轮询加载，加载完之后 再考虑直播中情况定时加载最新一条的逻辑
            // updateNewPageContent(id, dataMap.lastNumber, dataMap.defaultPageSize, "next");
            // changeTransContent(dataMap.contentList);
            let promises = [];
            for (let i = dataMap.lastNumber; i > 0; i--) {
              promises.push(() => {
                return queryLiveContent({
                  id,
                  pageIndex: i,
                  pageSize: dataMap.defaultPageSize,
                  type: dataMap.currentLive_status,
                });
              });
            }
            // 历史所有数据首次填充
            let hisContentList = [];
            let resList = await Promise.all(promises.map((fn) => fn()));
            resList.forEach((res2, ind) => {
              if (res2.ret === 0) {
                res2.data.live_contents.forEach((item: any, index: number) => {
                  hisContentList.push({
                    index:
                      (res2.data.page_number - 1) * dataMap.defaultPageSize + index + 1,
                    content: item.content,
                    real_time: item.real_time,
                    transContent: fillTransContent(item),
                  });
                });
              }
            });
            dataMap.contentList = hisContentList
              .concat(dataMap.contentList)
              .sort((a, b) => a.index - b.index);
            changeTransContent(dataMap.contentList);
          } else {
            // 只有一页
            res.data.live_contents.forEach((item: any, index: number) => {
              dataMap.contentList.push({
                index: index + 1,
                content: item.content,
                real_time: item.real_time,
                transContent: fillTransContent(item),
              });
            });
            changeTransContent(dataMap.contentList);
          }
        }
      }
    };
    const insertSuspensionBox = (content: any) => {
      let _dom = document.createElement("div");
      _dom.innerHTML = content;
      _dom.classList.add("suspension-box");
      _dom.addEventListener("click", function () {
        dataMap.showBottomFlag = true;
        smoothScrollToBottom("scroll");
      });
      document.querySelector("#scrollableDiv").appendChild(_dom);
      setTimeout(() => {
        _dom.classList.add("hidden");
      }, 3000);
      // 6秒之后移除
      setTimeout(function () {
        _dom.remove();
      }, 6000);
    };
    // 效果：contentList尾部拼接最新内容
    // 获取到新的lastNumber,如果变大了，则走情况1，如果没变，则走情况2。
    // 情况1：更新(覆盖)pageIndex页。循环执行updateNewPageContent()，直到lastNumber未变。
    // 情况2：更新(覆盖)最后一页。
    const updateNewPageContent = async (
      id: string,
      pageIndex: number,
      pageSize: number
    ) => {
      let res = await queryLiveContent({
        id,
        pageIndex,
        pageSize,
        type: dataMap.currentLive_status,
      });
      if (res.ret == 0) {
        // console.log("请求最新一页", pageIndex);

        //先将之前的最后一条数据渐变类名取消
        let dom = document.querySelector(".content-last");
        if (dom) {
          dom.classList.remove("content-last");
        }

        let tmp = [];
        res.data.live_contents.forEach((item: any, index: number) => {
          tmp.push({
            index: (pageIndex - 1) * pageSize + index + 1,
            content: item.content,
            real_time: item.real_time,
            transContent: fillTransContent(
              item,
              index == res.data.live_contents.length - 1 &&
                res.data.total_count > dataMap.contentList.length
                ? "last"
                : "normal"
            ), // 最新一条
          });
        });

        // 1s后背景色开始消退
        setTimeout(function () {
          let dom1 = document.querySelector(".content-last");

          if (dom1) {
            dom1.classList.add("hidden");
            // 最新一条悬浮内容填充
            if (!dataMap.showBottomFlag) {
              let _html = dom1.outerHTML;
              insertSuspensionBox(_html);
            }
          }
        }, 1000);

        let newLastNumber = Math.ceil(res.data.total_count / pageSize);
        // 如果不是最后一页，则concat ；如果已经是最后一页，则替换最后一页的
        if (newLastNumber > dataMap.lastNumber) {
          //   console.log("有新页数 老，新",dataMap.lastNumber,newLastNumber);
          dataMap.lastNumber = newLastNumber;
          dataMap.contentList = dataMap.contentList.concat(tmp);
        } else if (newLastNumber == dataMap.lastNumber) {
          //   console.log("没有新页数");
          // 如果没有新页数 且 条数也不变 则不用更新
          if (dataMap.contentList.length == res.data.total_count) {
            // console.log("没有新数据 ，页面不更新", res.data.total_count);
            return;
          } else {
            // 先删对应pageIndex页的，再插入  示例：lastNumber == 2   size == 20  total == 43   [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43]
            coverOldContent(dataMap.lastNumber, pageSize, tmp);
            // 更新完最后一页数据后，还需要判断是否当页数据满了
            if (tmp.length == pageSize) {
              dataMap.lastNumber++;
            }
          }
        }
        console.log("更新文本");
        changeTransContent(dataMap.contentList);
      }
    };
    const coverOldContent = (coverNumber: number, pageSize: number, tmp: any) => {
      dataMap.contentList = dataMap.contentList.filter((item: any, index: number) => {
        if (
          item.index < (coverNumber - 1) * pageSize ||
          item.index > coverNumber * pageSize
        ) {
          return true;
        }
      });
      dataMap.contentList.splice((coverNumber - 1) * pageSize, 0, ...tmp);
    };

    const changeTransContent = (contentList: any) => {
      dataMap.liveInfo.transContent = contentList
        .map((item) => item.transContent)
        .join("");
      dataMap.liveInfo.transContent_light = JSON.parse(
        JSON.stringify(dataMap.liveInfo.transContent)
      );
      // 置底启动
      if (dataMap.showBottomFlag) {
        setTimeout(() => {
          smoothScrollToBottom("scroll");
        }, 100);
      }

      // 每次更新文本需要记忆上次搜索的关键字和索引
      let searchText = sessionStorage.getItem("searchText");
      let searchIndex = sessionStorage.getItem("searchIndex");
      //   console.log("本地存储searchText===>", searchText, searchIndex);
      if (searchText && searchIndex) {
        dataMap.searchText = searchText;
        dataMap.currentIndex = Number(searchIndex);
        lightCurrentKeyword(searchText, "noscroll");
      }
    };
    const smoothScrollToBottom = (type: string = "scroll") => {
      const scrollableDiv = document.getElementById("scrollableDiv");
      if (type === "none") {
        scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
      } else {
        const targetScrollTop = scrollableDiv.scrollHeight;
        const startScrollTop = scrollableDiv.scrollTop;
        const duration = 500; // 动画持续时间，单位为毫秒
        const startTime = performance.now();

        function scrollAnimation(currentTime) {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / duration, 1);
          const easedProgress = easeInOutQuad(progress);
          isProgrammaticScroll = true; // 设置标志变量
          scrollableDiv.scrollTop =
            startScrollTop + (targetScrollTop - startScrollTop) * easedProgress;

          if (progress < 1) {
            requestAnimationFrame(scrollAnimation);
          }
        }

        function easeInOutQuad(t) {
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        }

        requestAnimationFrame(scrollAnimation);
      }
    };

    /**
     * @name 审核状态 0 未审核 1 不通过 2通过
     */
    const fillViolationListByType = (name: any = "all") => {
      let customizeDict = JSON.parse(JSON.stringify(dataMap.customizeList));

      let filterList = [];
      if (name == "all") {
        filterList = dataMap.liveInfo.violationList;
      } else {
        filterList = dataMap.liveInfo.violationList.filter((item) => item.status == name);
      }
      filterList.forEach((item) => {
        customizeDict.forEach((riskType) => {
          if (riskType.id == item.customize_label.index) {
            riskType.children.push(item);
            riskType.count++;
          }
        });
      });

      dataMap.filterViolationListByType = setStatus(customizeDict);
      dataMap.filterViolationListByType.forEach((item) => {
        if (item.count > 0) {
          dataMap.expends[item.id] = true;
        }
      });
    };

    const getLiveViolation = async (id: string) => {
      let resDataViolation = await queryLiveViolation({
        id,
        type: dataMap.currentLive_status,
        live_platform: -1,
        status: -1,
      });
      if (resDataViolation.ret == 0) {
        dataMap.liveViolations = resDataViolation.data.live_violations.map((item) => {
          return {
            ...item,
            content_html: setWordColor(item.content, item.labels[0].words),
          };
        });
        let violationArr = [];

        for (let item in dataMap.selectObj) {
          dataMap.selectObj[item] = false;
        }
        dataMap.tabList = [
          { label: "全部", name: "all", count: 0 },
          { label: "待人审", name: "0", count: 0 },
          { label: "人审通过", name: "2", count: 0 },
          { label: "人审不通过", name: "1", count: 0 },
        ];
        dataMap.tabList.forEach((item) => {
          if (item.name == "all") {
            item.count = dataMap.liveViolations.length;
          }
        });
        dataMap.liveViolations.forEach((item) => {
          // 统计各状态数量
          dataMap.tabList.forEach((tab) => {
            if (tab.name == item.status) {
              tab.count = tab.count + 1;
            }
          });
          let labels_str = "";
          let label_name = item.labels[0]?.lib_name || "";
          let label_num = item.labels[0]?.label || 0;
          // 判断是哪个类型的违规  lib_name有值则是自定义   无值则是系统违规
          if (item.violation_type === 3) {
            labels_str = "敏感词-" + label_name;
          } else if (item.violation_type === 4) {
            labels_str = "资质展示-" + label_name;
          } else {
            labels_str =
              (label_num.length > 3 ? violationDict[label_num.slice(0, 3)] + "-" : "") +
              violationDict[label_num] +
              ";";
          }
          violationArr.push({
            ...item,
            labels_str: labels_str,
            time: formatSeconds("", "", item.offset_time),
            real_time_num: item.real_time,
            real_time: dayjs(item.real_time * 1000).format(" HH:mm:ss"),
          });
        });

        dataMap.liveInfo.violationList = violationArr.sort(
          (a, b) => b.real_time_num - a.real_time_num
        );

        fillViolationListByType();
      }
    };

    // 启动定时器，每 10 秒请求一次数据
    const startInterval = () => {
      timer = setInterval(() => {
        // getLiveContent(dataMap.currentLive_id, "interval");
        updateNewPageContent(
          dataMap.currentLive_id,
          dataMap.lastNumber,
          dataMap.defaultPageSize
        ); // 更新最新一页
        getLiveViolation(dataMap.currentLive_id);
      }, 10000); // 每 10 秒请求一次
    };
    const checkLiveItem = async () => {
      // 判断是直播/历史  取对应obj
      //   console.log("详情页信息", dataMap.detailInfo);
      let item = dataMap.detailInfo as any;
      dataMap.video_start_time = item.start_time;
      if (!dataMap.storing || dataMap.storing == 0) {
        // 暂存状态下时不执行以下代码
        //   中间视频渲染 视频播放url改为https
        item.stream_url = item.stream_url?.replace("http://", "//");
        item.stream_url = item.stream_url?.replace("https://", "//");
        // 视频回放目前只有http ，https无法打开，暂不做协议替换
        // item.replay_url = item.replay_url?.replace('http://', '//');
        // item.replay_url = item?.replay_url.replace('https://', '//');
        let video_url =
          dataMap.currentLive_status == 0
            ? item.stream_url
            : dataMap.currentLive_status == 1
            ? item.replay_url
            : "";
        dataMap.videoDownLoadUrl = video_url;
        // 区分hls 和 flv 播放器
        dataMap.videoType = video_url?.indexOf(".m3u8") > -1 ? "hls" : "flv"; // 回放的话默认用flv播放器了

        if (dataMap.videoType === "hls") {
          dataMap.videoOptions = {
            ...dataMap.videoOptions,
            type: dataMap.currentLive_status == 0 ? "m3u8" : "video/mp4", // 直播是hls 其余MP4
            src: video_url,
          };
        } else {
          let flvPlayer = flvjs.createPlayer({
            type: dataMap.currentLive_status == 0 ? "flv" : "video/mp4",
            url: video_url,
            // 以下mp4 flv示例均可播放
            // type: 'flv',
            // url: '//sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/flv/xgplayer-demo-360p.flv',
            // type: 'video/mp4',
            // url: 'https://media.w3.org/2010/05/sintel/trailer.mp4'
          });
          // return;
          // 绑定 FLV 播放器到 <video> 标签
          flvPlayer.attachMediaElement(videoRef.value);
          // 初始化 FLV 播放器
          flvPlayer.load();
          flvPlayer.play();
        }
      }

      // 右侧直播内容
      await getLiveContent(dataMap.currentLive_id); // 1715667909678
      await getLiveViolation(dataMap.currentLive_id);

      // 有直播时，启动定时器。无直播时，清除定时器。
      // (代码顺序放在此处，因为要在首次加载过一次数据后，再执行定时器，【保证定时器请求的时候已经知道语音内容总页数了】)
      if (dataMap.currentLive_status == 0 && dataMap.storing == 0) {
        if (timer) {
          clearInterval(timer);
        }
        startInterval();
      } else {
        if (timer) {
          clearInterval(timer);
        }
      }
    };

    const videoError = (event: any) => {
      ElMessage.error("视频加载失败，请检查地址是否正确");
    };

    const downloadVideo = () => {
      // 直播中
      if (dataMap.currentLive_status == 0) {
        ElMessage.error("直播中，暂不支持下载直播视频");
        return;
      }
      // 回看
      let url = dataMap.videoDownLoadUrl + "?download=1";
      const link = document.createElement("a");
      link.href = url;
      link.download = "回放视频.mp4";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    // 拖动进度条结束
    const handleSeeked = () => {
      const currentTime = videoRef.value.currentTime;
    };
    const deal = async (item: any, status: number) => {
      // return;

      let timeType = dataMap.currentLive_status;
      let params = {
        ids: [item.id],
        time_type: Number(timeType), // 0: 实时直播 1: 历史直播
        role_name: dataMap.userInfo.username, // 审核人员
        status: status, // 0: 待审核 1: 审核不通过 2: 审核通过
        reason: item.reason, // 审核不通过原因
      };
      let res = await auditLiveViolation(params);
      if (res.ret == 0) {
        ElMessage.success("审核成功");
        item.status = status;
        item.role_name = dataMap.userInfo.username;
      } else {
        ElMessage.error("审核失败");
      }
    };
    const back = () => {
      proxy.$router.go(-1);
    };
    // 导出
    const exportResult = () => {
      dataMap.excelname = `直播详情_${dataMap.currentLive_id}.xls`;
      dataMap.jsonFields = {
        "发现时间(real_time)": "real_time",
        "疑似违规类型(label_one)": "label_one",
        "疑似违规内容(content)": "content",
        "人审结果(status)": "status",
        "人审意见(reason)": "reason",
        "审核人(role_name)": "role_name",
      };

      dataMap.list = dataMap.liveInfo.violationList;
      if (dataMap.list.length === 0) {
        ElMessage.warning("暂无数据");
      }
    };
    // 重审
    const reAudit = () => {};
    /**
     *tab.props.name 0 待审核 1 不通过 2 通过
     */
    const handleClick = (tab: any, event: Event) => {
      fillViolationListByType(tab.props.name);
    };
    // 给父类设置status
    const setStatus = (arr: any) => {
      dataMap.allcanChecked = false;
      arr.forEach((item) => {
        if (
          item.children.length > 0 &&
          item.children.some((child) => child.status === 0)
        ) {
          item.canChecked = true;
          dataMap.allcanChecked = true;
        } else {
          item.canChecked = false;
        }
      });
      return arr;
    };
    const getCustomize = async () => {
      try {
        let arr = [];
        let res = await queryCustomizeLabelInfo();
        if (res.ret === 0) {
          res.data.info_list.forEach((item) => {
            arr.push({
              id: item.index,
              label: item.label_name,
              children: [],
              count: 0,
            });
          });
          dataMap.customizeList = arr;
        } else {
          ElMessage.error(res.msg);
        }
      } catch (error) {
        ElMessage.error("获取风险分类列表失败");
      }
    };
    const bindScroll = () => {
      const scrollable = document.getElementById("scrollableDiv");
      // 监听滚动事件
      scrollable.addEventListener("scroll", function (event) {
        if (isProgrammaticScroll) {
          // 代码触发的滚动
          //   console.log('代码触发的滚动 ');
          isProgrammaticScroll = false;
        } else {
          // 用户手动滚动
          // 判断是否滚到最底部了
          if (
            scrollable.scrollHeight - scrollable.scrollTop - scrollable.clientHeight <
            10
          ) {
            dataMap.showBottomFlag = true; // 开启置底效果
            isProgrammaticScroll = true; // 重置变量
            //  console.log('用户手动滚动到底部')
          } else {
            dataMap.showBottomFlag = false; // 关闭置底效果
            //  console.log('用户手动滚动到中部,关闭置底效果 showBottomFlag = false');
            // 底部需要悬浮显示最新的一条
          }
        }
      });

      // 代码触发的滚动
      function scrollToBottom() {
        scrollable.scrollTop = scrollable.scrollHeight;
      }
    };
    // 赋值表格列宽
    const formatHeadList = (viewWidth: number) => {
      let _list = dataMap.tHeaderList;
      //   console.log("viewWidth", viewWidth);
      // >2000px 所有列用百分比
      if (viewWidth > 2000) {
        // console.log("超过2000px，重置列宽");
        dataMap.tHeaderList = [
          {
            name: "发现时间",
            width: "10%",
            type: "real_time",
            position: "left",
          },
          {
            name: "疑似违规类型",
            width: "20%",
            type: "labels",
            position: "left",
          },
          {
            name: "疑似违规内容",
            width: "35%",
            type: "content",
            position: "left",
          },
          {
            name: "人审结果",
            width: "10%",
            type: "status",
            position: "center",
          },
          {
            name: "人审意见",
            width: "15%",
            type: "reason",
            position: "center",
          },
          {
            name: "审核人",
            width: "10%",
            type: "role_name",
            position: "center",
          },
          {
            name: "操作",
            width: "10%",
            type: "oper",
            position: "right",
          },
        ];
      } else if (viewWidth <= 2000 && viewWidth > 1850) {
        dataMap.tHeaderList = [
          {
            name: "发现时间",
            // width: '10%',
            width: "130px",
            type: "real_time",
            position: "left",
          },
          {
            name: "疑似违规类型",
            // width: '20%',
            width: "141px",
            type: "labels",
            position: "left",
          },
          {
            name: "疑似违规内容",
            //   width: '35%',
            width: "750px",
            type: "content",
            position: "left",
          },
          {
            name: "人审结果",
            // width: '10%',
            width: "100px",
            type: "status",
            position: "center",
          },
          {
            name: "人审意见",
            // width: '15%',
            width: "150px",
            type: "reason",
            position: "center",
          },
          {
            name: "审核人",
            // width: '10%',
            width: "150px",
            type: "role_name",
            position: "center",
          },
          {
            name: "操作",
            // width: '10%',
            width: "100px",
            type: "oper",
            position: "right",
          },
        ];
      } else if (viewWidth <= 1850 && viewWidth > 1500) {
        dataMap.tHeaderList = [
          {
            name: "发现时间",
            width: "130px",
            type: "real_time",
            position: "left",
          },
          {
            name: "疑似违规类型",
            width: "141px",
            type: "labels",
            position: "left",
          },
          {
            name: "疑似违规内容",
            width: "450px",
            type: "content",
            position: "left",
          },
          {
            name: "人审结果",
            width: "100px",
            type: "status",
            position: "center",
          },
          {
            name: "人审意见",
            width: "150px",
            type: "reason",
            position: "center",
          },
          {
            name: "审核人",
            width: "150px",
            type: "role_name",
            position: "center",
          },
          {
            name: "操作",
            width: "100px",
            type: "oper",
            position: "right",
          },
        ];
      } else if (viewWidth <= 1500 && viewWidth > 1280) {
        dataMap.tHeaderList = [
          {
            name: "发现时间",
            width: "130px",
            type: "real_time",
            position: "left",
          },
          {
            name: "疑似违规类型",
            width: "141px",
            type: "labels",
            position: "left",
          },
          {
            name: "疑似违规内容",
            width: "200px",
            type: "content",
            position: "left",
          },
          {
            name: "人审结果",
            width: "100px",
            type: "status",
            position: "center",
          },
          {
            name: "人审意见",
            width: "150px",
            type: "reason",
            position: "center",
          },
          {
            name: "审核人",
            width: "150px",
            type: "role_name",
            position: "center",
          },
          {
            name: "操作",
            width: "100px",
            type: "oper",
            position: "right",
          },
        ];
      } else {
        dataMap.tHeaderList = [
          {
            name: "发现时间",
            width: "130px",
            type: "real_time",
            position: "left",
          },
          {
            name: "疑似违规类型",
            width: "141px",
            type: "labels",
            position: "left",
          },
          {
            name: "疑似违规内容",
            width: "200px",
            type: "content",
            position: "left",
          },
          {
            name: "人审结果",
            width: "100px",
            type: "status",
            position: "center",
          },
          {
            name: "人审意见",
            width: "100px",
            type: "reason",
            position: "center",
          },
          {
            name: "审核人",
            width: "100px",
            type: "role_name",
            position: "center",
          },
          {
            name: "操作",
            width: "100px",
            type: "oper",
            position: "right",
          },
        ];
      }

      // 判断是否是审核员
      if (!dataMap.isAuditor) {
        dataMap.tHeaderList.splice(6, 1); // 去掉操作列
      }
    };
    const resizeEvent = () => {
      // 输出当前窗口宽度
      formatHeadList(window.innerWidth);
    };
    onMounted(async () => {
      sessionStorage.removeItem("searchText");
      sessionStorage.removeItem("searchIndex");
      // 监听窗口大小变化事件
      // 在页面加载完成后立即调用一次，获取初始窗口大小
      console.log("页面加载完成后立即调用一次，重置列宽");
      formatHeadList(window.innerWidth);

      // 监听窗口大小变化
      window.addEventListener("resize", resizeEvent);

      // hash模式取参
      const obj: any = route.query;
      dataMap.currentLive_id = obj.live_id;
      dataMap.currentLive_status = obj.live_status;
      dataMap.storing = obj.storing;
      await getUnionLiveInfoByIds(obj.live_id);
      await getCustomize();
      checkLiveItem();
      bindScroll();
    });

    onUnmounted(() => {
      console.log("页面销毁");
      if (timer) {
        clearInterval(timer);
      }

      window.removeEventListener("resize", resizeEvent);
    });

    /**
     * @id 违规ID
     */
    const toAudit = (id: any = "") => {
      let type = "more";
      if (id) {
        dataMap.auditList = [id];
        type = "one";
      } else {
        dataMap.auditList = [];
        let bigTypes = dataMap.filterViolationListByType.map((item) => item.id);
        for (let key in dataMap.selectObj) {
          if (dataMap.selectObj[key] === true && !bigTypes.includes(parseInt(key))) {
            dataMap.auditList.push(key);
          }
        }
        if (dataMap.auditList.length === 0) {
          ElMessage.warning("请勾选审核内容");
          return;
        }
      }

      //   console.log("人工审核 整理审核列表", dataMap.auditList, dataMap.selectObj);
      AuditPopRef.value.openDialog = true;
      AuditPopRef.value.setType = type;
    };
    const renderList = async (data: any) => {
      let params = {
        time_type: Number(dataMap.currentLive_status),
        role_name: dataMap.userInfo.username,
        ids: dataMap.auditList,
        status: data.status,
        reason: data.reason,
      };
      let res = await auditLiveViolation(params);
      if (res.ret == 0) {
        ElMessage.success("审核成功");
        getLiveViolation(dataMap.currentLive_id);
      } else {
        ElMessage.error("审核失败");
      }
    };
    const expand = (id, flag) => {
      dataMap.expends[id] = flag;
    };
    // 总全选/不选  只根据id
    const selectAll = (val) => {
      let obj = {};
      dataMap.filterViolationListByType.forEach((item) => {
        if (item.canChecked) {
          // 先选父类
          obj[item.id] = val;
          // 再选子类
          item.children.forEach((child) => {
            // 不包括审核过的数据
            if (child.status == 0) {
              obj[child.id] = val;
            }
          });
        }
      });
      dataMap.selectObj = obj;
    };
    // 父类某一行 控制子类
    const selectPRow = (val, id) => {
      let children = dataMap.filterViolationListByType.find((item) => item.id == id)
        ?.children;
      if (children) {
        children.forEach((child) => {
          if (child.status == 0) {
            dataMap.selectObj[child.id] = val;
          }
        });
      }
    };
    // 子类某一行 控制父类
    const selectCRow = (val, id) => {
      let pid = dataMap.filterViolationListByType.find((item) =>
        item.children.some((child) => child.id == id)
      )?.id;
      let pRow = dataMap.filterViolationListByType.find((item) => item.id == pid);
      let flag = true;

      pRow.children.forEach((child) => {
        if (dataMap.selectObj[child.id] === false) {
          flag = false;
          return;
        }
      });
      dataMap.selectObj[pid] = flag;
    };
    // 监听selectObj变化  反选 全选按钮
    watch(
      () => dataMap.selectObj,
      (val, oldVal) => {
        if (Object.values(dataMap.selectObj).every((item) => item === true)) {
          dataMap.allChecked = true;
        } else {
          dataMap.allChecked = false;
        }
      },
      {
        deep: true,
      }
    );
    const openImagePreview = () => {
      image.value.clickHandler();
    };

    return {
      ...toRefs(dataMap),
      search,
      focusPrevious,
      focusNext,
      checkLiveItem,
      videoError,
      downloadVideo,
      videoRef,
      handleSeeked,
      CircleClose,
      CircleCheck,
      deal,
      back,
      // downloadFile,
      handleClick,
      toAudit,
      AuditPopRef,
      renderList,
      expand,
      selectAll,
      selectPRow,
      selectCRow,
      openImagePreview,
      image,
      exportResult,
      reAudit,
    };
  },
});
</script>

<style lang="scss" scoped>
.custom-header {
  // 解决全选按钮点击不同步
  .el-scrollbar .el-checkbox {
    width: 100%;
    height: 38px;
  }
}
.el-calendar {
  --el-calendar-cell-width: 55px;
  background-color: #111626;
  --el-calendar-border: 1px solid #1d2b3b;
  --el-calendar-selected-bg-color: #1f3062;
  .el-button {
    background: #111626;
    border-radius: 14px !important;
  }
  :deep(.el-calendar__header),
  :deep(.el-calendar__body) {
    align-items: center !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  .svg-icon {
    color: #596175; /* 设置 SVG 图形的颜色 */
  }
  .el-calendar-day:hover {
    color: #58a5ff;
    .svg-icon {
      color: #58a5ff;
    }
  }
  .is-selected .svg-icon {
    color: #58a5ff;
  }
  .calendar-cell {
    margin: 0;
    //不换行
    white-space: nowrap;
    &.white {
      color: #fff !important;
    }
    &.gray {
      color: #373f52 !important;
    }
  }
}
.el-calendar {
  :deep(.el-calendar-day) {
    position: relative !important;
    .live-icon {
      position: absolute;
      right: 6px;
      bottom: 4px;
    }
  }
}
.oper-row {
  margin-top: 10px;
}
td.el-table_1_column_3.is-left.el-table__cell .el-table__expand-icon {
  display: none !important;
}
.live-monitor {
  .page-top .item p {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .page-top {
    .item:nth-child(3) {
      //   width: 50%;
      flex: 1;
    }
  }
  .yswg {
    :deep(td.el-table_1_column_3.is-left.el-table__cell .el-table__expand-icon) {
      display: none !important;
    }
    .check-box,
    .check-box-1,
    .check-box-2 {
      margin-right: 20px;
    }
    .t_header {
      display: flex;
      align-items: center;
      .t_header_list {
        display: flex;
        flex: 1;
        .t_header_item:first-child {
          margin-left: 30px;
        }
      }
    }
    .t_body {
      margin-top: 16px;
      max-height: calc(100vh - 300px);
      overflow: auto;
      .row-title .title {
        min-height: 54px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #1d2b3b;
      }
      .content-cell {
        // width: 95%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cell {
        // 固定高度 超出部分省略号隐藏
        // display: flex;
        // align-items: center;
        height: 54px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      margin-top: 16px;
      .t_body_row {
        display: flex;
        align-items: center;
        &.isExpand {
          align-items: baseline;
        }

        .row-title {
          flex: 1;
          .expand {
            margin-right: 8px;
            cursor: pointer;
          }
        }
        // 展开后子表样式
        .t_body_child {
          margin-left: -34px;
          .t_body_child_row {
            display: flex;
            align-items: center;

            .check-box-2 {
              margin-right: 36px;
            }
            .t_body_child_list {
              line-height: 54px;
            }
          }
        }
      }
    }
  }

  .bbxx {
    > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      // flex-wrap: wrap;

      .item {
        flex: 1;
      }
      .item {
        height: 32px;
      }
    }
    .value-list {
      display: inline-block;
      cursor: pointer;
      .value {
        font-size: 14px;
        padding: 7px 8px;
        background: #242d4d;
        border-radius: 4px;
        margin-right: 8px;
      }
    }
  }
}
.infinite-list {
  height: 258px;
  padding: 0;
  margin: 0;
  list-style: none;
  width: calc(100% - 16px);
}
.infinite-list .infinite-list-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  background: var(--el-color-primary-light-9);
  margin: 10px;
  color: var(--el-color-primary);
}
.infinite-list .infinite-list-item + .list-item {
  margin-top: 10px;
}
.translate {
  position: relative;
  #scrollbar {
    height: 218px;
    width: 22px;
    background-color: #eee;
    position: relatiove;
    position: absolute;
    right: 0;
    top: 75px;
    background: #191f33 !important;

    #thumb {
      position: absolute;
      width: 100%;
      background-color: rgb(106 115 167);
      height: 20px;
      border-radius: 4px;
      top: 0;
      right: 0;
    }
    .up-btn {
      width: 22px;
      height: 20px;
      text-align: center;
      position: absolute;
      top: -20px;
      right: 0;
      background: #c3b9b9;
      color: #222;
      // 左上和右上圆角

      border-top-left-radius: 2px;
      border-top-right-radius: 2px;
      cursor: pointer;
    }
    .down-btn {
      width: 22px;
      height: 20px;
      text-align: center;
      position: absolute;
      bottom: -20px;
      right: 0;
      background: #c3b9b9;
      color: #222;
      border-bottom-left-radius: 2px;
      border-bottom-right-radius: 2px;
      cursor: pointer;
    }
  }
}
.video.no-video {
  background: #000;
  text-align: center;
  padding-top: 100px;
  p {
    font-size: 16px;
  }
}
</style>
