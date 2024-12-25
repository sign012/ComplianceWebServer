<template>
  <!--  运营审查-直播大厅 -->
  <div class="monitor-hall">
    <div class="account-manage">
      <div class="table-top">
        <span> 当前共{{ live_count }}场正在直播中</span>
        <span style="margin: 0 8px 0 40px">直播平台：</span>
        <el-select
          v-model="searchForm.live_platform"
          placeholder="请选择直播平台"
          style="width: 240px"
          @change="changePlatform"
        >
          <el-option label="不限" :value="-1"></el-option>
          <el-option
            v-for="(item, index) in plateformList"
            :key="index"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
      <div class="monitor-main">
        <el-card
          v-for="(item, index) in tableData"
          :key="index"
          class="monitor-card"
          style="max-width: 340px; height: 363px"
        >
          <div
            class="monitor-card-item"
            :class="['videoPlayer' + item.live_id]"
            @click="toLivePage(item)"
          >
            <!-- 鼠标划入时播放video -->
            <div class="video">
              <div
                class="live-status"
                :class="{
                  red: item.status === 'live',
                  blue: item.status === 'report',
                  gray: item.status === 'empty',
                  black: item.status == 'last',
                }"
              >
                <div class="live-icon" v-if="item.status === 'live'">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <img
                  src="../../assets/images/wait_live.png"
                  alt=""
                  v-if="item.status === 'report'"
                />
                <img
                  src="../../assets/images/no_live.png"
                  alt=""
                  v-if="item.status === 'empty'"
                />
                <img
                  src="../../assets/images/end_live.png"
                  alt=""
                  v-if="item.status === 'last'"
                />
                {{
                  item.status === "live"
                    ? "直播中"
                    : item.status === "report"
                    ? "待直播"
                    : item.status === "last"
                    ? "已结束"
                    : "暂无直播"
                }}
              </div>
              <vue3VideoPlay
                width="100%"
                height="188px"
                :src="item.stream_url"
                type="m3u8"
                muted
                :autoplay="false"
                :title="item.live_title"
                :controlBtns="['audioTrack', 'quality', 'volume']"
                :control="false"
                @play="handplay"
                @pause="handpause"
                @click="handclick"
                preload="none"
                :id="'videoPlayer' + item.live_id"
                v-if="item.status === 'live' && item.videoType === 'hls'"
              />
              <video
                :id="'video' + item.live_id"
                controls
                muted
                v-show="item.flag === false"
                style="width: 100%; height: 188px"
                v-if="item.status === 'live' && item.videoType === 'flv'"
              ></video>

              <img class="sit-img" :src="item.avatar_url" v-if="item.status !== 'live'" />
            </div>

            <!-- <div class="info" v-if="item.status !== 'empty'"> -->
            <div class="info">
              <img :src="item.avatar_url || noUser" alt="" />

              <div class="archor">
                <div class="title">{{ item.nickname }}</div>
                <div class="name">
                  <span class="nickname" v-if="item.status === 'live'">
                    已直播 {{ item.lived_time }}
                  </span>
                  <span class="nickname" v-if="item.status === 'last'">
                    直播时长 {{ item.lived_time }}
                  </span>
                  <span class="nickname" v-if="item.status === 'report'">待直播</span>
                  <span class="nickname" v-if="item.status === 'empty'"
                    >暂无直播计划</span
                  >
                  <!-- <span class="online-num">
                    <img src="../../assets/images/eye.png" alt="" style="width: 14px; height: 10px" />
                    {{ item.watch_count }}
                  </span> -->
                </div>
              </div>
              <img
                src="../../assets/images/hall-ypkt.png"
                alt=""
                class="plate-img"
                v-if="item.live_platform === 0"
              />
              <img
                src="../../assets/images/hall-sph.png"
                alt=""
                class="plate-img"
                v-if="item.live_platform === 1"
              />
              <img
                src="../../assets/images/hall-dy.png"
                alt=""
                class="plate-img"
                v-if="item.live_platform === 2"
              />
              <img
                src="../../assets/images/hall-xet.png"
                alt=""
                class="plate-img"
                v-if="item.live_platform === 3"
              />
              <img
                src="../../assets/images/hall-ths.png"
                alt=""
                class="plate-img"
                v-if="item.live_platform === 4"
              />
              <img
                src="../../assets/images/hall-ks.png"
                alt=""
                class="plate-img"
                v-if="item.live_platform === 5"
              />
            </div>
            <div class="detail">
              <div>
                {{ item.status === "last" ? "直播标题" : "报备标题" }}：
                <span>{{ item.live_title || "--" }}</span>
              </div>
              <div>
                {{ item.status === "last" ? "直播时段" : "报备时段" }}：
                <span>{{ item.report_duration || "--" }}</span>
              </div>
              <!-- <div>
                报备脚本：
                <span
                  @click="downloadFile(item.live_script_url)"
                  class="download"
                  title="点击下载"
                  v-if="item.live_script_url"
                >
                  {{ item.live_script_files.length > 0 ? item.live_script_files.join(',') : '' }}
                </span>
              </div> -->
              <!-- <div>
                报备内容：
                <span>{{ item.live_content || '--' }}</span>
              </div> -->
              <div v-if="item.status === 'live' || item.status === 'last'">
                本场发现疑似违规记录{{ item.violation_count }}次
              </div>
            </div>
          </div>
        </el-card>
        <div v-if="tableData.length === 0">暂无数据</div>
      </div>
    </div>
    <div class="violation-record">
      <div class="violation-top">
        <div style="font-size: 20px">机审疑似违规</div>
        <div class="table-top" style="margin-top: 16px">
          <!-- <el-select
            v-model="violationType"
            placeholder="请选择违规类型"
            @change="changeViolationType"
            style="width: 180px"
          >
            <el-option label="全部" value="all"></el-option>

            <el-option
              v-for="(item, index) in violationDictWeb"
              :key="index"
              :label="item"
              :value="index"
            ></el-option>
          </el-select> -->
          <el-select
            v-model="searchFormVio.live_platform"
            placeholder="请选择直播平台"
            style="width: 180px"
            @change="resetViolation"
            :disabled="showBatchAudit"
          >
            <el-option label="不限" :value="-1"></el-option>
            <el-option
              v-for="(item, index) in plateformList"
              :key="index"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <el-select
            v-model="searchFormVio.checkStatus"
            placeholder="请选择审核状态"
            @change="resetViolation"
            style="margin-left: 16px; width: 120px"
            :disabled="showBatchAudit"
          >
            <el-option label="不限" :value="-1"></el-option>
            <el-option label="已通过" :value="2"></el-option>
            <el-option label="未通过" :value="1"></el-option>
            <el-option label="待审核" :value="0"></el-option>
          </el-select>
          <el-button
            color="#3A62F7"
            style="
              font-size: 14px;
              line-height: 32px;
              height: 32px;
              padding: 0 16px;
              margin-left: 16px;
              box-sizing: border-box;
            "
            @click="
              searchFormVio.checkStatus = -1;
              searchFormVio.live_platform = -1;
              resetViolation();
            "
            :disabled="showBatchAudit"
          >
            重置
          </el-button>
          <el-button
            color="#3A62F7"
            style="
              font-size: 14px;
              line-height: 32px;
              height: 32px;
              padding: 0 16px;
              margin-left: 16px !important;
              box-sizing: border-box;
            "
            @click="toShowBatchAudit"
          >
            {{ showBatchAudit ? "取消批量" : "批量审查" }}
          </el-button>
        </div>
      </div>
      <div
        class="violation-list"
        @scroll="handleScroll"
        :class="[showBatchAudit ? 'collapsed' : '']"
      >
        <el-card
          v-for="(item, index) in violationDataFilter"
          :key="index"
          class="violation-card"
          :id="'violation' + index"
        >
          <el-checkbox
            v-model="selectObj[item.id]"
            label=""
            @change="selectRow($event, item.id)"
            :disabled="item.status !== 0"
            v-if="showBatchAudit"
            style="position: absolute; left: -32px; top: calc(50% - 20px)"
          ></el-checkbox>
          <div class="item">
            <div class="top">
              <div class="top-left">
                <img
                  src="../../assets/images/hall-dy.png"
                  alt=""
                  v-if="item.platform == 0"
                />
                <img
                  src="../../assets/images/hall-dy.png"
                  alt=""
                  v-if="item.platform == 1"
                />
                <img
                  src="../../assets/images/hall-dy.png"
                  alt=""
                  v-if="item.platform == 2"
                />
                <img
                  src="../../assets/images/hall-dy.png"
                  alt=""
                  v-if="item.platform == 3"
                />
                <img
                  src="../../assets/images/hall-dy.png"
                  alt=""
                  v-if="item.platform == 4"
                />
                <img
                  src="../../assets/images/hall-dy.png"
                  alt=""
                  v-if="item.platform == 5"
                />
                <span class="time">{{ item.time }}</span>
                <img
                  :src="item.avatar_url || noUser"
                  alt=""
                  style="width: 20px; height: 20px; border-radius: 50%"
                />
                <span class="nickname">{{ item.nickname }}</span>
              </div>
              <div class="top-right">
                <!-- <span class="tag" v-for="(items, indexs) in item.labels" :key="indexs">
                  {{
                    (items.label.length > 3 ? violationDict[items.label.slice(0, 3)] + '-' : '') +
                    violationDict[items.label]
                  }}
                </span> -->
                <span class="tag">
                  {{ item.labels_str }}
                </span>
              </div>
            </div>
            <div class="bottom">
              <div class="bottom-left">
                <img
                  src="../../assets/images/image.png"
                  alt=""
                  v-if="item.violation_type === 1"
                />
                <img
                  src="../../assets/images/voice.png"
                  alt=""
                  v-if="item.violation_type === 3 || item.violation_type === 2"
                />
                <img
                  src="../../assets/images/message.png"
                  alt=""
                  v-if="item.violation_type === 4"
                />
                <p v-if="item.content" v-html="item.content_html"></p>

                <!-- <el-image 
                         :src="item.image_url" 
						  alt=""
						    :preview-src-list="[item.image_url]"
						    v-if="item.image_url"
							  style="width: 80px; height: 100px; margin-left: 10px"
							   :initial-index="0"
                        /> -->
                <img
                  :src="item.image_url"
                  alt=""
                  v-if="item.image_url"
                  style="width: 80px; height: 100px; margin-left: 10px"
                  :id="'myImg' + index"
                  @click="showPic(item.image_url, index)"
                />
              </div>
              <el-button
                color="#3A62F7"
                @click="toAudit(item.id)"
                style="width: 78px; height: 24px; line-height: 24px"
                v-show="!showBatchAudit && item.status === 0"
                >审核</el-button
              >

              <span
                v-show="!showBatchAudit && item.status !== 0"
                class="status-tag"
                :class="[item.status === 2 ? 'green' : 'orange']"
              >
                <img
                  src="../../assets/images/close-circle-fill.png"
                  alt=""
                  v-if="item.status === 1"
                />
                <img
                  src="../../assets/images/check-circle-fill.png"
                  alt=""
                  v-if="item.status === 2"
                />
                <img src="" alt="" v-if="item.status === 1" />
                {{ item.status === 2 ? "已通过" : "不通过" }}</span
              >
            </div>
            <div class="oper-row" v-if="item.status !== 0">
              <span class="reason">理由：{{ item.reason || "无" }}</span>
              <div class="tag" :class="[item.status === 2 ? 'green' : 'orange']">
                <img
                  src="../../assets/images/warning-orange.png"
                  alt=""
                  style="width: 20px; height: 20px; vertical-align: bottom"
                  v-if="item.refuse_type === 1"
                />

                {{ refuseTypes[item.refuse_type] || "无" }}
              </div>
              <!-- <el-input
                v-model="item.reason"
                :placeholder="
                  item.status === 2 || item.status === 1 ? '' : '请输入审核结论'
                "
                :disabled="item.status === 2 || item.status === 1"
                :title="item.reason"
              >
                <template #append>
                  <div
                    class="checked"
                    v-show="item.status === 2 || item.status === 1"
                    style="margin-right: 20px"
                  >
                    <span style="color: #838ba1; font-size: 12px; margin-right: 20px">
                      审核人：{{ item.role_name }}
                    </span>
                    <el-button type="text" :icon="CircleCheck" v-if="item.status === 2"
                      >已通过</el-button
                    >
                    <el-button
                      type="text"
                      :icon="CircleClose"
                      v-if="item.status === 1"
                      style="color: #ff823c"
                    >
                      未通过
                    </el-button>
                  </div>
                  <div v-show="item.status !== 1 && item.status !== 2">
                    <el-button
                      type="text"
                      :icon="CircleClose"
                      @click="deal(item, 1)"
                      style="
                        color: #3a62f7;
                        border: 1px solid #3a62f7;
                        background-color: transparent;
                        margin-right: 10px;
                      "
                    >
                      不通过
                    </el-button>
                    <el-button
                      :icon="CircleCheck"
                      size="mini"
                      @click="deal(item, 2)"
                      style="
                        margin-right: 5px;
                        background: #3a62f7 !important;
                        color: white;
                        border: none;
                        padding: 0 10px;
                      "
                    >
                      通过
                    </el-button>
                  </div>
                </template>
              </el-input> -->
            </div>
          </div>
        </el-card>
        <div class="noData" v-if="!violationDataFilter.length">暂无违规记录</div>
      </div>
      <div class="block" v-if="!showBatchAudit">
        <el-config-provider :locale="zhCn">
          <el-pagination
            small
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pageObj.pageIndex"
            :page-sizes="[10, 20, 30, 40]"
            :page-size="pageObj.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pageObj.total"
          ></el-pagination>
        </el-config-provider>
      </div>
      <div class="allcheck" v-if="showBatchAudit">
        <el-checkbox v-model="allChecked" @change="selectAll">全选</el-checkbox>
        <el-button color="#3A62F7" @click="toAudit('')">审核</el-button>
      </div>
    </div>
    <!-- <ViewPop ref="ViewPopRef"></ViewPop> -->
    <!-- <div v-dialogdrag>
      <el-dialog
        custom-class="pic-dialog"
        v-model="dialogVisible"
        :modal="false"
        :width="dialogWidth"
        :height="dialogHeight"
        :before-close="handleClose"
        title="查看图片"
      >
        <img :src="img_url" @load="onImageLoad" style="width: 100%; height: 100%" />
      </el-dialog>
    </div> -->
    <!-- 弹窗 -->
    <div id="myModal" class="modal">
      <div class="modal-content" id="modalContainer">
        <img id="modalImg" />
        <span class="close">&times;</span>
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
  watch,
  getCurrentInstance,
  ref,
} from "vue";
import {
  queryLiveCurrent,
  queryLiveViolation,
  auditLiveViolation,
  queryEmployee,
} from "@/api/runCheck";
import dayjs from "dayjs";
import { Search } from "@element-plus/icons";
import EditPop from "./components/EditPop.vue";
import { useRoute, useRouter } from "vue-router";
import { violationDict, plateformList, plateImgDict } from "@/utils/dict";
import { formatSeconds, setWordColor } from "@/utils/validate";
import flvjs from "flv.js";
import { CircleClose, CircleCheck } from "@element-plus/icons";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { getDeptList } from "@/api/user";
import { getSubDepartments } from "@/utils/validate.js";
import ViewPop from "./components/view-pop";
import noUser from "@/assets/images/no-user.jpg";
import AuditPop from "./components/audit-pop.vue";
export default defineComponent({
  name: "LiveConfig",
  components: {
    Search,
    EditPop,
    ViewPop,
    AuditPop,
  },
  setup() {
    var timer: any = null;
    const ViewPopRef = ref();
    const AuditPopRef = ref(null);
    const route = useRoute();
    const store = useStore();
    let { proxy }: any = getCurrentInstance();

    const dataMap = reactive({
      noUser,
      dialogVisible: false,
      img_url: "",
      dialogWidth: "auto",
      dialogHeight: "auto",
      userInfo: store.state.user, // 当前用户信息
      violationType: "all",
      violationDictWeb: {},
      searchFormVio: {
        checkStatus: -1,
        live_platform: -1,
      },
      liveIds: [], // 正在直播live_id列表
      zhCn,
      flag: true,
      playerList: [] as any,
      videoType: "flv",
      tableData: [] as any,
      violationData: [] as any,
      violationDataFilter: [] as any,
      violationDict,
      live_count: 0, // 正在直播场数
      pageObj: {
        pageIndex: 1,
        pageSize: 20,
        total: 0,
      },
      accessDeptIds: [],
      accessEmployeeIds: [],
      searchForm: {
        live_platform: -1,
      },
      plateformList,
      plateImgDict,
      auditList: [], // 处理列表
      selectObj: {} as any, // 已选择批量审查
      showBatchAudit: false, // 展示选择框
      allChecked: false,
      refuseTypes: {
        0: "记录",
        1: "警告",
        2: "断流",
      },
      monitoringList: [], // 监控主播id列表
      employeeList: [], // 员工列表
    });

    let isFirstClick = false;

    document.addEventListener("click", function (event) {
      if (isFirstClick) {
        console.log("这是页面的首次点击交互");
        // 在这里执行首次点击后的逻辑
        // bindPlayEvent(); //  video移入移出事件绑定
        // 标记首次点击已经发生
        isFirstClick = false;
      }
    });

    const fillVideoElement = (data: any) => {
      data.forEach((item) => {
        // 判断显示flv播放器还是vue3-video-play播放器
        if (item.videoType === "flv") {
          item.flag = false;
          let flvPlayer = flvjs.createPlayer(
            {
              type: "flv",
              url: item.stream_url, // 替换为实际的 FLV 视频 URL
            },
            {
              autoCleanupSourceBuffer: true, // 自动清理 SourceBuffer 避免残留问题
              autoCleanupMaxBackwardDuration: 10, // 自动清理缓冲区
              autoCleanupMinBackwardDuration: 5, // 保留的最小缓冲区
            }
          );
          //   console.log("flvPlayer", flvPlayer);
          const videoDom = document.getElementById(
            `video${item.live_id}`
          ) as HTMLVideoElement;
          //  绑定 FLV 播放器到 <video> 标签
          flvPlayer.attachMediaElement(videoDom);
          // 初始化 FLV 播放器
          flvPlayer.load();
          //   flvPlayer.play();
          // dataMap.playerList.push(flvPlayer);

          // 捕获播放错误
          // 监听错误事件
          //   flvPlayer.on(flvjs.Events.ERROR, (event, data) => {
          //     console.error("捕获到 flv.js 错误：", data);

          //     // 根据错误类型处理
          //     if (data.type === flvjs.ErrorTypes.NETWORK_ERROR) {
          //       console.error("网络错误：", data.details);
          //     } else if (data.type === flvjs.ErrorTypes.MEDIA_ERROR) {
          //       console.error("媒体错误：", data.details);
          //     } else if (data.type === flvjs.ErrorTypes.OTHER_ERROR) {
          //       console.error("其他错误：", data.details);
          //     }

          //     // 处理错误（例如重试播放）
          //     handleError(flvPlayer, data);
          //   });
        }
      });
    };
    const handleError = (flvPlayer: any, errorData: any) => {
      if (
        errorData.type === flvjs.ErrorTypes.MEDIA_ERROR &&
        errorData.details === (flvjs.ErrorDetails as any)?.BUFFER_APPEND_ERROR
      ) {
        console.error("SourceBuffer 追加数据失败，尝试清理并重试");
        // flvPlayer.unload(); // 清理播放器
        // flvPlayer.load(); // 重新加载
        // flvPlayer.play(); // 重新播放
      }
    };
    // 处理四种状态的直播卡片
    const formatData = (data: any) => {
      let _arr = [];
      let statusDict = {
        live: 4,
        empty: 1,
        report: 3,
        last: 2,
      };
      data.forEach((item: any, index: any) => {
        if (item.status === "live") {
          item.live.stream_url = item.live.stream_url?.replace("http://", "//");
          item.live.stream_url = item.live.stream_url?.replace("https://", "//");
          // index == 0
          //   ? (item.live.stream_url =
          //       '//sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/flv/xgplayer-demo-360p.flv')
          //   : (item.live.stream_url = 'http://playertest.longtailvideo.com/adaptive/bipbop/gear4/prog_index.m3u8');
          let video_type = item.live.stream_url.indexOf(".m3u8") > -1 ? "hls" : "flv";
          _arr.push({
            status: item.status,
            lived_time: formatSeconds(item.live.start_time, new Date().getTime() / 1000), // 直播时长
            report_duration:
              item.live.report_info.start_time && item.live.report_info.end_time
                ? dayjs(item.live.report_info.start_time * 1000).format(
                    "YYYY/MM/DD HH:mm"
                  ) +
                  "-" +
                  dayjs(item.live.report_info.end_time * 1000).format("HH:mm")
                : "", // 计划直播时间段
            ...item.live,
            avatar_url: item.avatar_url,
            status_num: statusDict[item.status],
            employee_id: item.employee_id,
            nickname: item.nickname,
            live_title: item.live.report_info.live_title, // 直播报备标题
            live_script_url: item.live.report_info.live_script_url, // 直播报备内容
            live_script_files: item.live.report_info.live_script_files, // 直播报备文件名
            live_content: item.live.report_info.live_content, // 直播报备内容
            // live_id: index,
            videoType: video_type,
          });
        } else if (item.status === "report") {
          _arr.push({
            status_num: statusDict[item.status],
            employee_id: item.employee_id,
            nickname: item.nickname,
            avatar_url: item.avatar_url,
            status: item.status,
            lived_time: "", // 直播时长
            violation_count: "-", // 违规次数
            report_duration:
              item.report.start_time && item.report.end_time
                ? dayjs(item.report.start_time * 1000).format("YYYY/MM/DD HH:mm") +
                  "-" +
                  dayjs(item.report.end_time * 1000).format("HH:mm")
                : "", // 计划直播时间段

            ...item.report,
          });
        } else if (item.status === "empty") {
          _arr.push({
            status_num: statusDict[item.status],
            employee_id: item.employee_id,
            nickname: item.nickname,
            avatar_url: item.avatar_url,
            status: item.status,
            lived_time: "", // 直播时长
            report_duration: "", // 计划直播时间段
            violation_count: "-", // 违规次数
            live_script_url: "-", // 直播报备内容
            live_script_files: [], // 直播报备文件名
            live_content: "", // 直播报备内容
          });
        } else if (item.status === "last") {
          _arr.push({
            status_num: statusDict[item.status],
            employee_id: item.employee_id,
            nickname: item.nickname,
            avatar_url: item.avatar_url,
            status: item.status,
            lived_time: formatSeconds(item.last.start_time, item.last.end_time), // 直播时长
            report_duration:
              item.last.start_time && item.last.end_time
                ? dayjs(item.last.start_time * 1000).format("YYYY/MM/DD HH:mm") +
                  "-" +
                  dayjs(item.last.end_time * 1000).format("HH:mm")
                : "", // 计划直播时间段
            live_script_url: "", // 直播报备内容
            live_script_files: [], // 直播报备文件名
            live_content: "", // 直播报备内容
            ...item.last,
          });
        }
      });
      // 排序 一级：按直播状态 二级：按开始时间
      _arr = _arr.sort((a, b) => {
        // 计算 start_time 与当前时间的绝对值
        const diffA = Math.abs(a.start_time - new Date().getTime() / 1000);
        const diffB = Math.abs(b.start_time - new Date().getTime() / 1000);

        // 根据绝对值进行排序
        return diffA - diffB;
      });

      _arr = _arr.sort((a, b) => b.status_num - a.status_num);
      return _arr;
    };
    const toQueryLive = async () => {
      let idlist =
        dataMap.userInfo.userList.length > 0
          ? dataMap.userInfo.userList
          : dataMap.accessEmployeeIds;
      let params = {
        employee_id: idlist || [],
        live_platform: dataMap.searchForm.live_platform,
      };
      // 考虑部门非无，且部门下无主播权限
      let isEmpty =
        dataMap.accessEmployeeIds.length === 0 && dataMap.userInfo.departId !== 0;
      if (isEmpty) {
        return;
      }
      try {
        let res = await queryLiveCurrent(params);
        if (res.ret == 0) {
          // 填充_data正在直播信息
          let _data = res.data.lives.filter((item) =>
            dataMap.monitoringList.includes(item.employee_id)
          ); // 过滤掉未监控主播
          dataMap.live_count = _data.filter((item) => item.status === "live").length;
          dataMap.tableData = formatData(_data);
          // dataMap.tableData = dataMap.tableData.concat(dataMap.tableData); // 多条调试
          let _liveData = dataMap.tableData.filter((item) => item.status === "live");

          // 直播中live_id
          // dataMap.liveIds = _liveData.map((item) => item.live_id);

          setTimeout(() => {
            // 初始化flv播放器 需要在video Dom元素渲染完成后才可以
            fillVideoElement(_liveData);
          });
          setDSQ();
        } else {
          ElMessage.error("获取直播列表失败，请重试");
        }
      } catch (error) {
        ElMessage.error("获取直播列表超时，请重试");
      }
    };
    const setDSQ = () => {
      // 有直播时，启动定时器。无直播时，清除定时器。
      if (dataMap.live_count > 0) {
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
    const bindPlayEvent = () => {
      // const videoElements = document.querySelectorAll('video') as any;
      const videoElements = document
        .querySelector(".monitor-hall")
        .querySelectorAll(".sit-img") as any;
      videoElements.forEach((video: any) => {
        // 绑定播放事件
        // video外面div绑定移入事件，移入时播放对应id的video
        const videoBox: any = document.querySelector("." + video.id);
        videoBox.addEventListener("mouseenter", () => {
          console.log("鼠标移入", video.id);
          return;
          // video.load();
          video.currentTime = video.duration - 2; // 播放最新位置 -2s优化用户体验，避免每次播放都要马上加载新片段
          video.play(); // 鼠标移入时播放视频
        });

        videoBox.addEventListener("mouseleave", () => {
          console.log("鼠标移出", video.id);
          return;
          video.pause(); // 鼠标移出时暂停视频
        });
      });
    };

    const handplay = (event: any) => {
      event.target.controls = true;
      console.log("点击了  触发播放");
    };
    const handpause = (event: any) => {
      event.target.controls = false;
      console.log("点击了  触发暂停");
    };
    const handclick = () => {
      console.log("点击了卡片");
    };
    const toLivePage = (row: any) => {
      if (row.status === "report") {
        ElMessage.info(
          `直播暂未开始，最近一场开播时间：${dayjs(row.start_time * 1000).format(
            "MM-DD HH:mm"
          )}`
        );
        return;
      } else if (row.status === "empty") {
        ElMessage.info("暂无直播计划");
        return;
      }

      if (isFirstClick) return;
      if (row.status !== "live" && row.status !== "last") return;
      console.log("跳转直播监控页面", row);

      proxy.$router.push({
        path: "/oper-review/live-monitor",
        query: {
          live_id: row.live_id,
          // live_id: 'LiveA20240611170938AUP00003A2A2A40',
          //   live_status: row.status == 'live' ? 0 : 1 // 0实时直播 1 历史直播
          live_status: row.status == "live" ? 0 : row.replay_url ? 1 : 0, // 0实时直播 1 历史直播
          storing: row.status == "last" && row.replay_url == "" ? 1 : 0, // 1 转存中 0 已结束
        },
      });
    };
    const toQueryViolation = async () => {
      let idlist =
        dataMap.userInfo.userList.length > 0
          ? dataMap.userInfo.userList
          : dataMap.accessEmployeeIds;
      //请求违规记录列表
      let params = {
        employee_id: idlist || [],
        status: dataMap.searchFormVio.checkStatus,
        live_platform: dataMap.searchFormVio.live_platform,
      };
      // 考虑部门非无，且部门下无主播权限
      let isEmpty =
        dataMap.accessEmployeeIds.length === 0 && dataMap.userInfo.departId !== 0;
      if (isEmpty) {
        return;
      }
      try {
        let res = await queryLiveViolation(params);

        if (res.ret == 0) {
          dataMap.violationData = res.data.live_violations
            .map((item, index) => {
              let labels_str = "";
              let label_name = item.labels[0]?.lib_name || "";
              let label_num = item.labels[0]?.label || 0;
              // 判断是哪个类型的违规  lib_name有值则是我们平台定义敏感词， 无值则是火山定义违规
              if (item.violation_type === 3) {
                labels_str = "敏感词-" + label_name;
              } else if (item.violation_type === 4) {
                labels_str = "资质展示-" + label_name;
              } else {
                labels_str =
                  (label_num.length > 3
                    ? (violationDict[label_num.slice(0, 3)]
                        ? violationDict[label_num.slice(0, 3)]
                        : "自定义") + "-"
                    : "") +
                  (violationDict[label_num] ? violationDict[label_num] : "其他") +
                  // ";";
                  "";
              }

              return {
                ...item,
                labels_str: labels_str,
                kssj: dayjs(item.start_time * 1000).format("YYYY/MM/DD HH:mm:ss"),
                jssj: dayjs(item.end_time * 1000).format("YYYY/MM/DD HH:mm:ss"),
                time: dayjs(item.real_time * 1000).format("  HH:mm:ss"),
                reason: item.reason,
                status: item.status,
                id: item.id,
                role_name: item.role_name,
                content_html: setWordColor(item.content, item.labels[0].words),
                //   image_url:'https://pics0.baidu.com/feed/242dd42a2834349bc3aafd58e39fd1c034d3bec7.jpeg?token=4fb6798418aa9edd0b4c59183ea433de',  // 调试代码  图片地址
                //   reason: "测试代码", // 测试代码
                //   status: 2, // 测试代码
                //   refuse_type: 1, //测试代码
              };
            })
            .reverse();
          dataMap.violationData = dataMap.violationData.filter((item) =>
            dataMap.monitoringList.includes(item.employee_id)
          ); // 过滤掉未监控主播
          dataMap.pageObj.total = dataMap.violationData.length;
          toFillViolationDictWeb();
          toFilterViolationData();
        } else {
          ElMessage.error("获取违规记录失败，请重试");
        }
      } catch (error) {
        ElMessage.error("获取违规记录超时，请重试");
      }
    };
    const downloadFile = (url) => {
      // 创建一个隐藏的 a 元素
      const link = document.createElement("a");
      link.href = url;
      link.download = "直播脚本压缩包"; // 设置下载文件的名称，可选
      console.log("下载直播脚本", link);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    const toFillViolationDictWeb = () => {
      // 填充违规字典
      let _violationDictWeb = {};
      dataMap.violationData.forEach((item) => {
        item.labels.forEach((label) => {
          if (Object.keys(_violationDictWeb).indexOf(label.label) === -1) {
            if (dataMap.violationDict[label.label]) {
              _violationDictWeb[label.label] = dataMap.violationDict[label.label];
            } else if (
              label.lib_name &&
              Object.keys(_violationDictWeb).indexOf(label.lib_name) === -1
            ) {
              if (item.violation_type === 3) {
                _violationDictWeb[label.label] = "敏感词 - " + label.lib_name;
              } else if (item.violation_type === 4) {
                _violationDictWeb[label.label] = "资质展示 - " + label.lib_name;
              }
            }
          }
        });
      });
      dataMap.violationDictWeb = _violationDictWeb;
    };
    // 筛选违规数据
    const toFilterViolationData = () => {
      // 1.违规类型
      let _data = dataMap.violationData;
      // dataMap.violationType === "all"
      //   ? dataMap.violationData
      //   : dataMap.violationData.filter((item) =>
      //       item.labels.some((label) => label.label === dataMap.violationType)
      //     );
      dataMap.violationDataFilter = _data.slice(
        (dataMap.pageObj.pageIndex - 1) * dataMap.pageObj.pageSize,
        dataMap.pageObj.pageIndex * dataMap.pageObj.pageSize
      );
    };
    const handleCurrentChange = (pageIndex: number) => {
      dataMap.pageObj.pageIndex = pageIndex;
      toFilterViolationData();
    };
    const handleSizeChange = (pageSize: number) => {
      dataMap.pageObj.pageSize = pageSize;
      toFilterViolationData();
    };
    onMounted(async () => {
      await togetDeptList();
      await toQueryEmployee();
      await toQueryLive();
      await toQueryViolation();

      initMovePic();
    });
    const initMovePic = () => {
      // 获取元素
      const modal = document.getElementById("myModal");
      const modalContainer = document.getElementById("modalContainer");
      const modalImg = document.getElementById("modalImg");
      const closeBtn = document.querySelector(".close");
      const images = document.querySelectorAll(".bottom-left img");

      // 点击图片时显示弹窗
      images.forEach((img) => {
        img.onclick = function () {
          modal.style.display = "block";
          modalImg.src = this.src;
          // 拖拽功能
          // 1.每次点击打开图片，图片位置归零
          // 2.鼠标按下时，记录初始位置
          // 3.鼠标移动时，移动图片位置
          // 4.鼠标松开时，不在移动图片位置

          let startX = 0;
          let startY = 0;
          let isMove = false;

          modalContainer.onmousedown = function (e) {
            e.preventDefault();
            startX = e.clientX - modalContainer.offsetLeft;
            startY = e.clientY - modalContainer.offsetTop;
            isMove = true;
          };

          document.body.onmousemove = function (e) {
            if (isMove) {
              let moveX = e.clientX - startX;
              let moveY = e.clientY - startY;
              let left = moveX;
              let top = moveY;
              console.log("moveX", moveX, "moveY", moveY, "left", left, "top", top);

              modalContainer.style.left = `${left}px`;
              modalContainer.style.top = `${top}px`;
            }
          };

          document.body.onmouseup = function (e) {
            isMove = false;
          };

          // // 缩放功能
          modalContainer.onwheel = function (e) {
            e.preventDefault();
            const scaleFactor = e.deltaY < 0 ? 1.1 : 0.9;
            const currentScale = modalContainer.classList.contains("scaled") ? 1.5 : 1;
            const newScale = currentScale * scaleFactor || 1;

            modalContainer.style.transform = `translateY(-50%) scale(${newScale})`;

            if (newScale > 1) {
              modalContainer.classList.add("scaled");
            } else {
              modalContainer.classList.remove("scaled");
            }
          };
        };
      });

      // 点击关闭按钮时隐藏弹窗
      closeBtn.onclick = function () {
        modal.style.display = "none";
      };
    };
    const togetDeptList = async () => {
      let res: any = await getDeptList();
      if (res.iRet === 0) {
        // 获取 id 为 departId 的部门及其所有子部门的 id
        dataMap.accessDeptIds = getSubDepartments(res.data, dataMap.userInfo.departId);
        // console.log("子部门", dataMap.accessDeptIds);
      }
    };

    // 获取所属部门+子部门主播id列表
    const toQueryEmployee = async () => {
      let params = {
        employee_id: dataMap.userInfo.userList,
      };
      let resEmployee = await queryEmployee(params);
      if (resEmployee.ret == 0) {
        dataMap.employeeList = resEmployee.data.employees
          .filter((item) => dataMap.accessDeptIds.includes(item.dept_id)) // 根据部门隔离员工列表
          .map((item) => {
            return {
              label: item.nickname,
              value: item.employee_id,
              avatar_url: item.avatar_url,
              live_platform: item.live_platform,
            };
          });
        dataMap.accessEmployeeIds = dataMap.employeeList.map((item) => item.value);
        // 监控中主播id
        dataMap.monitoringList = resEmployee.data.employees
          .filter((item) => item.monitor_status === 1)
          .map((item) => item.employee_id);
      }
    };
    onUnmounted(() => {
      clearPage();
    });
    // 清除页面定时器，清除播放器
    const clearPage = () => {
      if (timer) {
        console.log("清除定时器");
        clearInterval(timer);
      }
      const monitorHall = document.querySelector(".monitor-hall") as any;
      if (monitorHall) {
        const videoElements = monitorHall.querySelectorAll("video") as any;
        videoElements.forEach((video) => {
          video.src = ""; // 切掉播放源，中止请求播放
          //   if (video.parentNode) {
          //     video.parentNode.removeChild(video);
          //   }
        });
      }
    };
    // 监听路由变化
    watch(
      () => route.path,
      (newPath, oldPath) => {
        if (newPath !== "/oper-review/moniHall") {
        }
      }
    );

    // 启动定时器，每 5 秒请求一次数据
    const startInterval = () => {
      console.log("开启定时器");
      timer = setInterval(toQueryViolation, 10000); // 每 10 秒请求一次
    };

    // 初始化
    // startInterval();
    // const changeViolationType = (type: any) => {
    //   dataMap.violationType = type;
    //   toFilterViolationData();
    // };
    const deal = async (item: any, status: number) => {
      //   console.log('处理', item);
      // return;
      // let timeType = dataMap.liveIds.includes(item.live_id) ? 0 : 1;
      let params = {
        ids: [item.id],
        time_type: 0, // 0: 实时直播 1: 历史直播
        role_name: dataMap.userInfo.username, // 审核人员
        status: status, // 0: 待审核 1: 审核不通过 2: 审核通过
        reason: item.reason, // 审核不通过原因
      };
      //   console.log('params', params);
      let res = await auditLiveViolation(params);
      if (res.ret == 0) {
        ElMessage.success("操作成功");
        item.status = status;
        item.role_name = dataMap.userInfo.username;
      } else {
        ElMessage.error("操作失败");
      }
    };
    const showPic = (url: string) => {
      console.log("showPic", url);
      dataMap.dialogVisible = true;
      dataMap.img_url = url;
    };
    const handleClose = (done: any) => {
      dataMap.dialogVisible = false;
      done();
    };
    const onImageLoad = (event: any) => {
      const img = event.target;
      dataMap.dialogWidth = `${img.naturalWidth}px`;
      dataMap.dialogHeight = `${img.naturalHeight}px`;
    };
    // 重置后，手动置顶，并且重启定时器（如果有直播的话）
    const resetViolation = async () => {
      await toQueryViolation();
      // 置顶
      const element = document.getElementById("violation0");
      element && element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setTimeout(() => {
        setDSQ(); // 避免置顶后延迟触发滚动逻辑，再次中断定时器
      }, 1000);
    };
    // 列表发生滚动，关闭定时器
    const handleScroll = (event: any) => {
      if (timer) {
        console.log("handleScroll 清除定时器");
        clearInterval(timer);
      }
    };
    /**
     * @id 违规ID
     */
    const toAudit = (id: any = "") => {
      let type = "more";
      dataMap.auditList = [];
      if (id) {
        dataMap.auditList = [id];
        type = "one";
      } else {
        // 批量审核
        for (let key in dataMap.selectObj) {
          if (dataMap.selectObj[key] === true) {
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
        time_type: 0,
        role_name: dataMap.userInfo.username,
        ids: dataMap.auditList,
        status: data.status,
        reason: data.reason,
        // refuse_type:data.refuse_type, // 处罚措施 0 记录 1 警告 2 断流
      };
      console.log("审核入参", params);
      let res = await auditLiveViolation(params);
      if (res.ret == 0) {
        ElMessage.success("审核成功");
        dataMap.showBatchAudit = false;
        toQueryViolation();
      } else {
        ElMessage.error("审核失败");
      }
    };
    // 勾选行
    const selectRow = (val, id: string) => {
      dataMap.selectObj[id] = val;
      if (Object.values(dataMap.selectObj).some((value) => value === false)) {
        dataMap.allChecked = false;
      } else {
        dataMap.allChecked = true;
      }
    };
    const toShowBatchAudit = () => {
      // 重置selectObj
      dataMap.selectObj = {};
      for (let i = 0; i < dataMap.violationDataFilter.length; i++) {
        dataMap.selectObj[`${dataMap.violationDataFilter[i].id}`] = false;
      }
      //   console.log("初始selectObj", dataMap.selectObj);
      dataMap.showBatchAudit = !dataMap.showBatchAudit;
      dataMap.auditList = [];

      // 批量时 关闭定时器，取消时，重启定时器
      if (dataMap.showBatchAudit) {
        if (timer) {
          console.log("清除定时器");
          clearInterval(timer);
        }
      } else {
        resetViolation();
      }
    };
    const selectAll = (val: boolean) => {
      for (let key in dataMap.selectObj) {
        dataMap.selectObj[key] = val;
      }
    };
    const changePlatform = () => {
      clearPage();
      toQueryLive();
    };
    return {
      ...toRefs(dataMap),
      handplay,
      handpause,
      toLivePage,
      downloadFile,
      handclick,
      CircleClose,
      CircleCheck,
      handleCurrentChange,
      handleSizeChange,
      //   changeViolationType,
      toFilterViolationData,
      deal,
      showPic,
      ViewPopRef,
      handleClose,
      onImageLoad,
      resetViolation,
      handleScroll,
      toQueryLive,
      toAudit,
      AuditPopRef,
      renderList,
      selectRow,
      toShowBatchAudit,
      selectAll,
      changePlatform,
    };
  },
});
</script>
<style lang="scss" scoped>
.monitor-hall {
  display: flex;
  height: calc(100vh - 50px);
  overflow: hidden;
  :deep(.el-input--mini .el-input__inner) {
    line-height: 32px;
    height: 32px;
  }
}
.monitor-hall {
  :deep(.up-pop .el-input--mini .el-input__inner) {
    line-height: 36px;
    height: 36px;
  }
}
.monitor-hall .account-manage {
  width: 63%;
  padding-right: 0 !important;
  padding-top: 0 !important;
}
.violation-record {
  min-height: calc(100vh - 100px);
  background: rgba(26, 32, 54, 0.5);
  //   padding: 20px;
  margin: 24px 0;
  flex: 1;
  overflow: auto;
  border-radius: 12px;
  :deep(.el-card__body) {
    padding: 0;
  }
  .violation-top {
    padding: 20px 20px 0 20px;
  }
  .violation-list {
    padding: 0 20px;
    margin-top: 20px;
    height: calc(100vh - 286px);
    overflow-y: auto;
    &.collapsed {
      padding-left: 50px;
    }
    .violation-card {
      margin-bottom: 20px;
      position: relative;
      overflow: visible;
      border: none;
      background: #20283f;
      border-radius: 6px;

      .top {
        padding: 12px 12px 10px;

        .top-left span {
          margin-right: 10px;
          vertical-align: middle;
          & .time {
            color: #838ba1;
            margin-right: 16px;
          }
        }
        .top-left > img {
          margin-right: 10px;
          vertical-align: middle;
          width: 24px;
          height: 24px;
        }

        .top-right {
          // white-space: nowrap;

          // overflow: hidden;
          // text-overflow: ellipsis;
          max-width: 45%;
        }
        .tag {
          padding: 0 8px;
          margin-right: 8px;
          margin-bottom: 4px;
          background: rgba(255, 35, 35, 0.1);
          color: rgba(255, 35, 35, 1);
        }
      }
      .bottom {
        align-items: end;
        padding: 0 12px 12px;
        .status-tag {
          border: 1px solid #838ba1;
          border-radius: 100px;
          width: 78px;
          text-align: center;
          height: 24px;
          line-height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          &.green {
            color: #0fc351;
            border-color: #0fc351;
          }
          &.orange {
            color: #ff823c;
            border-color: #ff823c;
          }
        }
      }
      .oper-row {
        background: #343d5c;
        height: 32px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 12px;
        border-bottom-left-radius: 6px;
        border-bottom-right-radius: 6px;
        .reason {
          color: #838ba1;
        }
        .tag {
        }
      }
      //     margin-top: 8px;
      //     :deep(.el-input--mini .el-input__inner) {
      //       color: #838ba1 !important;
      //       font-size: 14px !important;
      //       line-height: 32px !important;
      //       height: 32px !important;
      //       width: 55% !important;
      //     }

      //     .el-input-group {
      //       display: flex !important;
      //       align-items: center !important;
      //     }
      //     .el-input.is-disabled .el-input__inner {
      //       background-color: #191f33 !important;
      //     }
      //   }
      //   .oper-row {
      //     :deep(.el-input.is-disabled .el-input__inner) {
      //       background-color: #191f33 !important;
      //       max-width: 80%;
      //       white-space: nowrap;
      //       text-overflow: ellipsis;
      //     }
      //   }
    }
  }
}
.violation-list .top,
.violation-list .bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .bottom-left {
    width: 80%;
    display: flex;
    align-items: flex-start;
    p {
      display: inline;
      margin: 0;
      line-height: 20px;
      margin-left: 8px;
    }
    img {
      cursor: pointer;
    }
  }
}
.live-icon {
  display: inline-block;
  font-size: 0; /* 清除 inline-block 元素之间的空格 */
}

.live-icon span {
  display: inline-block;
  width: 2px;
  height: 7px;
  background-color: #fff;
  margin-right: 2px;
  animation: signal 0.7s infinite linear;
}

.live-icon span:nth-child(2) {
  animation-delay: 0.2s;
}

.live-icon span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes signal {
  0%,
  100% {
    height: 10px;
  }
  50% {
    height: 5px;
  }
}
.block {
  .el-pagination__jump {
    margin-left: 4px;
  }
}
.allcheck {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 72px;
  background: #20283f;
  padding: 0 20px;
  .el-button {
    width: 78px;
    height: 24px;
  }
}
</style>
