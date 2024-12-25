// element弹窗拖拽
/**
 *   使用方法:
 *   <div v-dialogdrag>
 *      <el-dialog></el-dialog>
 *   </div>
 * */
const dialogDrag = (app: any, options: any) => {
  app.directive('dialogdrag', {
    // 渲染完毕
    mounted(el: any, binding: any) {
		// // 针对图片拖拽弹框特殊处理
		// let dialogHeaderEl = el.querySelector('.el-dialog__header')
		// console.log('头部高度',window.getComputedStyle(el.querySelector('.el-dialog__header') as any).height);
		// if( window.getComputedStyle(el.querySelector('.el-dialog__header') as any).height === '0px') {
		// console.log('取图片主体');
	 	// dialogHeaderEl =  el.querySelector('.el-dialog__body');
		// } else {
		// console.log('取弹框头部');
		// dialogHeaderEl = el.querySelector('.el-dialog__header');
		// }
      const dialogHeaderEl = el.querySelector('.el-dialog__header') ;
      const dragDom = el.querySelector('.el-dialog');
      dialogHeaderEl.style.cursor = 'move';
	  el.querySelector('.el-dialog')
	 
      // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
      const sty = dragDom.currentStyle || window.getComputedStyle(dragDom, null);

      dialogHeaderEl.onmousedown = (e: any) => {
        // 鼠标按下，计算当前元素距离可视区的距离
        const disX = e.clientX - dialogHeaderEl.offsetLeft;
        const disY = e.clientY - dialogHeaderEl.offsetTop;

        // 获取到的值带px 正则匹配替换
        let styL = 0;
        let styT = 0;

        // 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
        if (sty.left.includes('%')) {
          styL = +document.body.clientWidth * (+sty.left.replace(/\%/g, '') / 100);
          styT = +document.body.clientHeight * (+sty.top.replace(/\%/g, '') / 100);
        } else {
          styL = +sty.left.replace(/\px/g, '');
          styT = +sty.top.replace(/\px/g, '');
        }

        document.onmousemove = function (e: any) {
          // 通过事件委托，计算移动的距离
          const left = e.clientX - disX;
          const top = e.clientY - disY;
          // 移动当前元素
          dragDom.style.left = `${left + styL}px`;
          dragDom.style.top = `${top + styT}px`;
          // 将此时的位置传出去
          // binding.value({x:e.pageX,y:e.pageY})
        };

        document.onmouseup = function (e) {
          document.onmousemove = null;
          document.onmouseup = null;
        };
      };
    }
  });
};

export default dialogDrag;
