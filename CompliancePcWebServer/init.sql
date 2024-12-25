INSERT INTO db_dt.t_dtuser (userbasic_uid,userbasic_password,userbasic_usertype,userbasic_rids,userbasic_userstatus,userbasic_exinfo_chname,userbasic_exinfo_cardtype,userbasic_exinfo_cardid,userbasic_exinfo_mail,userbasic_exinfo_telno,userbasic_exinfo_remark,userbasic_exinfo_individualflag,userbasic_tradeaccounts,userbasic_domainid,userbasic_modpass,userbasic_regdate,userbasic_extraparams,userbasic_slavedomainid,userbasic_companyid,departid,orgid,salt,realname,created,modified,isdel,mgrtype,stopmoney,extraparams,auto_create_time,auto_update_time,closemoney) VALUES
	 ('admin','348b72ac45bd42d84d37473d93301a12','A','','0','','','','','13986064064','','0',NULL,'',1,'',NULL,'','','','','XY39UC','超级管理员Admin',0,0,0,'S',0.0,NULL,'2021-11-23 17:20:51','2022-04-15 13:52:38',0.0);


INSERT INTO db_dt.t_mgr_menu (pId,menuName,menuPath,menuIcon,isLeaf,filePath,IsValid,sort) VALUES
	 (0,'系统管理','system','table',0,NULL,1,6),
	 (1,'菜单管理','menu-mgr','table',1,'menu-mgr',1,NULL),
	 (1,'角色管理','roles-mgr','table',1,'roles-mgr',1,NULL),
	 (0,'风险控制','riskControl','table',0,NULL,1,3),
	 (4,'全局风控设置','global','table',1,'globalRiskCtl',1,NULL),
	 (0,'资产管理','asset-management','table',0,'',1,1),
	 (0,'实时监控','monitor','table',0,'',1,2),
	 (7,'当日交易数据','todayTrade','table',1,'todayTrade',0,NULL),
	 (7,'异常交易数据修复','todayTrade','table',1,'todayTrade',1,0),
	 (7,'交易预警监控','tradeWarming','table',1,'tradeWarming',1,NULL);
INSERT INTO db_dt.t_mgr_menu (pId,menuName,menuPath,menuIcon,isLeaf,filePath,IsValid,sort) VALUES
	 (7,'柜台服务监控','counterService','table',1,'counterService',0,NULL),
	 (7,'实时交易监控','realtimeTrade','table',1,'realtimeTrade',0,NULL),
	 (6,'券商账号管理','account','table',1,'accountManage',1,1),
	 (6,'券商账号同步','sync','table',1,'accountSync',0,2),
	 (6,'券商账号资产','asset','table',1,'accountAssets',1,3),
	 (6,'券商资产分配','allocation','table',1,'assetAllocation',1,4),
	 (6,'员工持仓调整','positions','table',1,'employeePositions',0,6),
	 (6,'员工分配汇总','assignment','table',1,'employeeAssignment',1,7),
	 (6,'员工碎股清理','clean','table',1,'brokenCleaning',1,8),
	 (6,'员工锁券审核','lockCoupon','table',1,'lockCoupon',1,9);
INSERT INTO db_dt.t_mgr_menu (pId,menuName,menuPath,menuIcon,isLeaf,filePath,IsValid,sort) VALUES
	 (6,'员工资源分配','resource','table',1,'resourceAllocation',1,5),
	 (6,'账号分配汇总','accountAllocation','table',1,'accountAllocation',1,10),
	 (0,'数据统计','dataStatistics','table',0,'',1,4),
	 (23,'历史委托记录','entrustment','table',1,'entrustmentRecord',1,NULL),
	 (23,'历史成交记录','trade','table',1,'tradeRecord',1,NULL),
	 (23,'历史交割单记录','deliveryNote','table',1,'deliveryNote',1,NULL),
	 (23,'历史结算记录','settlement','table',1,'settlementRecord',1,NULL),
	 (23,'详细业绩统计','performanceStatistics','table',1,'performanceStatistics',1,NULL),
	 (23,'资产业绩统计','assetStatistics','table',1,'assetStatisticsDay',0,NULL),
	 (23,'员工月统计','monthlyStatistics','table',1,'monthlyStatistics',0,NULL);
INSERT INTO db_dt.t_mgr_menu (pId,menuName,menuPath,menuIcon,isLeaf,filePath,IsValid,sort) VALUES
	 (23,'账户标的统计(日)','accountStatisticsDay','table',1,'accountStatisticsDay',1,NULL),
	 (23,'资产业绩统计(日)','assetStatisticsDay','table',1,'assetStatisticsDay',1,NULL),
	 (0,'原始数据','defaultData','table',0,'',0,5),
	 (0,'综合管理','base-data','table',0,'',1,8),
	 (34,'部门管理','department','table',1,'department',1,3),
	 (34,'操作日志查询','operateLog','table',1,'operateLog',1,5),
	 (34,'登陆日志','login-log','table',1,'loginLog',1,6),
	 (34,'员工管理','employee-manage','table',1,'employeeManage',1,4),
	 (0,'智能分析','test','table',0,'',0,7),
	 (39,'测试','test','table',1,'test',1,NULL);
INSERT INTO db_dt.t_mgr_menu (pId,menuName,menuPath,menuIcon,isLeaf,filePath,IsValid,sort) VALUES
	 (34,'机构管理','orgManager','table',1,'orgManager',1,1),
	 (34,'柜台节点管理','trade-counter-mgr','table',1,'tradeCounterMgr',1,2),
	 (0,'模拟柜台','simulation','table',0,'',1,9),
	 (43,'资金账号','account','table',1,'simAccount',1,1),
	 (43,'资产管理','asset-base','table',1,'simAssetBase',1,2),
	 (43,'订单管理','order','table',1,'simOrder',1,3),
	 (43,'仓位管理','position','table',1,'simPosition',1,5),
	 (23,'账户标的统计(月)','accountStatisticsMonth','table',1,'accountStatisticsMonth',1,NULL),
	 (23,'资产业绩统计(月)','assetStatisticsMonth','table',1,'assetStatisticsMonth',1,NULL),
	 (23,'资产业绩统计','assetStatistics','table',1,'assetStatistics',1,NULL);
INSERT INTO db_dt.t_mgr_menu (pId,menuName,menuPath,menuIcon,isLeaf,filePath,IsValid,sort) VALUES
	 (23,'交易员业绩排行','employeeRanking','table',1,'employeeRanking',1,NULL),
	 (23,'员工月统计','monthlyStatistics','table',1,'monthlyStatistics',1,NULL),
	 (23,'标的交易统计','transaction','table',1,'transactionStatistics',0,NULL),
	 (4,'员工停机位设置','employeeShutdown','table',1,'employeeShutdown',1,NULL),
	 (6,'账户分组管理','group-mgr','table',1,'groupManage',1,11),
	 (43,'成交记录','order-his','table',1,'simOrderHis',1,4),
	 (34,'交易日志','tradeUserLog','table',1,'tradeUserLog',1,7),
	 (4,' 员工交易限制','tradeLimit','table',1,'tradeLimit',1,0),
	 (7,'公共池监控','publicCoupon','table',1,'publicCoupon',1,0),
	 (7,'实时交易监控','realtimeTrade','table',1,'realtimeTrade',1,0);
INSERT INTO db_dt.t_mgr_menu (pId,menuName,menuPath,menuIcon,isLeaf,filePath,IsValid,sort) VALUES
	 (4,'资产包风控设置','assetRiskCtl','table',1,'assetRiskCtl',1,3),
	 (7,'异常单快捷平仓','employeePositions','table',1,'employeePositions',1,1),
	 (7,'员工下撤单记录','employOrdInfo','table',1,'employOrdInfo',1,4),
	 (7,'柜台服务监控','counterService','table',1,'counterService',1,4),
	 (7,'交易员持仓状况','employPosition','table',1,'employPosition',1,5),
	 (7,'限定资源监控','resources-monitor','table',1,'resources-monitor',1,6),
	 (7,'个股盈亏状况','symbol-funds','table',1,'symbol-funds',1,9);



INSERT INTO db_dt.t_mgr_role (roleType,roleName,isValid,menuList) VALUES
	 ('A','机构管理员',1,'{"4":[{"id":5,"name":"全局风控设置"},{"id":54,"name":"员工停机位设置"},{"id":58,"name":" 员工交易限制"},{"id":62,"name":"资产包风控设置"}],"6":[{"id":13,"name":"券商账号管理"},{"id":15,"name":"券商账号资产"},{"id":16,"name":"券商资产分配"},{"id":21,"name":"员工资源分配"},{"id":18,"name":"员工分配汇总"},{"id":19,"name":"员工碎股清理"},{"id":20,"name":"员工锁券审核"},{"id":22,"name":"账号分配汇总"},{"id":55,"name":"账户分组管理"}],"7":[{"id":10,"name":"交易预警监控"},{"id":9,"name":"异常交易数据修复"},{"id":60,"name":"公共池监控"},{"id":61,"name":"实时交易监控"},{"id":63,"name":"异常单快捷平仓"},{"id":64,"name":"员工下撤单记录"},{"id":66,"name":"交易员持仓状况"},{"id":67,"name":"限定资源监控"},{"id":68,"name":"个股盈亏状况"}],"23":[{"id":24,"name":"历史委托记录"},{"id":25,"name":"历史成交记录"},{"id":26,"name":"历史交割单记录"},{"id":27,"name":"历史结算记录"},{"id":28,"name":"详细业绩统计"},{"id":31,"name":"账户标的统计(日)"},{"id":32,"name":"资产业绩统计(日)"},{"id":48,"name":"账户标的统计(月)"},{"id":49,"name":"资产业绩统计(月)"},{"id":50,"name":"资产业绩统计"},{"id":51,"name":"交易员业绩排行"},{"id":52,"name":"员工月统计"}],"34":[{"id":35,"name":"部门管理"},{"id":38,"name":"员工管理"},{"id":36,"name":"操作日志查询"},{"id":37,"name":"登陆日志"},{"id":57,"name":"交易日志"}]}'),
	 ('T','部门管理员',1,'{"6":[{"id":21,"name":"员工资源分配"},{"id":18,"name":"员工分配汇总"}],"7":[{"id":9,"name":"公共池监控"}],"23":[{"id":24,"name":"历史委托记录"},{"id":25,"name":"历史成交记录"},{"id":26,"name":"历史交割单记录"},{"id":28,"name":"详细业绩统计"},{"id":52,"name":"员工月统计"}]}');


UPDATE t_mgr_role set auto_inc_id = 1 WHERE roleName = '机构管理员'
UPDATE t_mgr_role set auto_inc_id = 2 WHERE roleName = '部门管理员'


INSERT INTO db_dt.t_dtglobalconfig (id,value,auto_create_time,auto_update_time,isdel) VALUES
	 ('AUTO_AUDIT','0','2022-03-01 14:02:02','2022-03-01 14:02:02',0),
	 ('AUTO_CLEAN_LOG','[]','2022-03-23 15:49:27','2022-03-23 17:51:19',0),
	 ('HOLD_POSITION_TIMEOUT','{"default":900}','2022-05-19 17:20:48','2022-05-27 18:07:48',0),
	 ('PENDING_ORDER_TIMEOUT','{"default":600}','2022-05-19 17:20:48','2022-05-27 18:07:48',0),
	 ('TENTH_GEAR_OPENING','1','2022-03-01 14:01:29','2022-03-01 17:41:35',0);

INSERT INTO t_dtglobalconfig
(id, value, auto_create_time, auto_update_time, isdel)
VALUES('NOTIFY_USER_SETTINGS', '{"default":[1,2,3,4,6,7,8]}', '2022-06-28 10:46:16', '2022-07-11 14:02:18', 0);