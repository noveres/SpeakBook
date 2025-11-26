-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: mydb.cdmi02sy2nwn.eu-north-1.rds.amazonaws.com    Database: speak_book
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `audios`
--

DROP TABLE IF EXISTS `audios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audios` (
                          `id` int NOT NULL AUTO_INCREMENT,
                          `name` varchar(200) NOT NULL COMMENT '音訊名稱',
                          `url` varchar(500) NOT NULL COMMENT '音訊URL',
                          `duration` int DEFAULT NULL COMMENT '時長（秒）',
                          `file_size` int DEFAULT NULL COMMENT '檔案大小（字節）',
                          `category` varchar(50) DEFAULT NULL COMMENT '分類',
                          `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
                          PRIMARY KEY (`id`),
                          KEY `idx_category` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='音訊表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audios`
--

LOCK TABLES `audios` WRITE;
/*!40000 ALTER TABLE `audios` DISABLE KEYS */;
INSERT INTO `audios` VALUES (2,'5iki.wav','https://files.catbox.moe/f0s6ov.wav',NULL,1311116,NULL,'2025-10-25 12:06:11'),(3,'Horror Impact Body Struck With Shovel 01.wav','https://files.catbox.moe/m1lba7.wav',NULL,125894,NULL,'2025-10-25 13:19:54'),(4,'Horror Demon Taking Bite 01.wav','https://files.catbox.moe/cg7k3l.wav',NULL,300142,NULL,'2025-10-25 13:20:03'),(5,'Horror Monster Growl 02.wav','https://files.catbox.moe/w9e1wb.wav',NULL,595556,NULL,'2025-10-25 13:20:08'),(6,'Horror Demonic Possession 01.wav','https://files.catbox.moe/6bfy0y.wav',NULL,1662268,NULL,'2025-10-25 13:20:27'),(7,'Horror Scary Bone Cracking And Breaking Short Fast 01.wav','https://files.catbox.moe/nku06g.wav',NULL,110102,NULL,'2025-10-25 13:20:34'),(8,'Horror Scary Human Male Caveman Angry Scream 01.wav','https://files.catbox.moe/78vr8p.wav',NULL,408252,NULL,'2025-10-25 13:20:48'),(9,'Horror Scary Human Female Screaming 01.wav','https://files.catbox.moe/q8t0nr.wav',NULL,260122,NULL,'2025-10-25 13:21:04'),(10,'Horror Scary Human Female Speaking Spell 11.wav','https://files.catbox.moe/h8t77y.wav',NULL,365678,NULL,'2025-10-25 13:21:15'),(11,'Horror Scary Human Female Scream Blood Curdling Scream 01.wav','https://files.catbox.moe/dhm5eg.wav',NULL,724270,NULL,'2025-10-25 13:21:31'),(12,'Horror Scary Human Male Laugh Witch Cackle Laugh 01.wav','https://files.catbox.moe/4xje63.wav',NULL,457994,NULL,'2025-10-25 13:21:49'),(13,'好多隻腳的超可愛小貓咪，可以數數他有幾隻腳嗎..wav','https://files.catbox.moe/qacgq2.wav',NULL,329004,NULL,'2025-10-26 20:12:05'),(14,'哇~好大隻的雞.wav','https://files.catbox.moe/pbcgry.wav',NULL,134444,NULL,'2025-10-26 20:12:20'),(17,'這是一隻看起來像雞的狗.wav','https://files.catbox.moe/0btioc.wav',NULL,160044,NULL,'2025-10-26 20:18:04'),(18,'大麥蟲.MP3','https://files.catbox.moe/l639ja.MP3',NULL,745480,NULL,'2025-10-28 18:43:29'),(19,'牛.MP3','https://files.catbox.moe/tvvrs0.MP3',NULL,616330,NULL,'2025-10-28 18:44:07'),(20,'雞.MP3','https://files.catbox.moe/j5hvc1.MP3',NULL,672755,NULL,'2025-10-28 18:44:24'),(21,'這是一顆好大顆的蘋果.wav','https://files.catbox.moe/3jdx6k.wav',NULL,213804,NULL,'2025-10-29 23:35:54');
/*!40000 ALTER TABLE `audios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `books`
--

DROP TABLE IF EXISTS `books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `books` (
                         `id` int NOT NULL AUTO_INCREMENT,
                         `title` varchar(200) NOT NULL COMMENT '教材標題',
                         `author` varchar(100) DEFAULT NULL COMMENT '作者',
                         `description` text COMMENT '教材描述',
                         `category` varchar(50) DEFAULT NULL COMMENT '分類',
                         `pages` int DEFAULT '0' COMMENT '頁數',
                         `target_age` varchar(20) DEFAULT NULL COMMENT '適用年齡',
                         `difficulty` varchar(20) DEFAULT NULL COMMENT '難度等級',
                         `cover_image_url` varchar(500) DEFAULT NULL COMMENT '圖片URL',
                         `status` enum('draft','published') DEFAULT 'draft' COMMENT '狀態：草稿/已發布',
                         `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
                         `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
                         `published_at` timestamp NULL DEFAULT NULL COMMENT '發布時間',
                         PRIMARY KEY (`id`),
                         KEY `idx_status` (`status`),
                         KEY `idx_category` (`category`),
                         KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='教材主表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `books`
--

LOCK TABLES `books` WRITE;
/*!40000 ALTER TABLE `books` DISABLE KEYS */;
INSERT INTO `books` VALUES (14,'TEST','','','童話故事',0,'3-6歲','簡單','https://files.catbox.moe/kl43p3.png','published','2025-10-25 12:33:42','2025-10-25 12:33:42','2025-10-25 12:33:42'),(16,'我是標題','鄭阿志','這是用來做觸控語音輔助的DEMO教材','童話故事',0,'3-6歲','簡單','https://files.catbox.moe/g4lbsh.png','published','2025-10-26 20:21:47','2025-10-26 20:21:47','2025-10-26 20:21:47'),(18,'生態保育教材_雞','Howard','雞的介紹','科普知識',0,'9-12歲','簡單','https://files.catbox.moe/z0pthl.png','published','2025-10-28 19:05:12','2025-10-28 19:05:12','2025-10-28 19:05:12'),(20,'生態保育教材_牛','Howard','牛的相關介紹','科普知識',0,'9-12歲','簡單','https://files.catbox.moe/flijnf.png','published','2025-10-28 19:08:27','2025-10-28 19:08:27','2025-10-28 19:08:27'),(21,'生態保育教材_大麥蟲','Howard','大麥蟲相關介紹','科普知識',0,'9-12歲','簡單','https://files.catbox.moe/52fuk0.png','published','2025-10-28 19:09:39','2025-10-28 19:09:39','2025-10-28 19:09:39'),(22,'生態保育系列_雞_飛行','Howard','雞 飛行動作','科普知識',0,'9-12歲','簡單','https://files.catbox.moe/ethc9l.png','published','2025-10-28 19:13:34','2025-10-28 19:13:34','2025-10-28 19:13:34'),(23,'生態保育教材_牛_吃東西','Howard','牛吃東西','科普知識',0,'9-12歲','簡單','https://files.catbox.moe/69lpuc.png','published','2025-10-28 19:16:03','2025-10-28 19:16:03','2025-10-28 19:16:03'),(24,'生態保育教材_大麥蟲_黑','Howard','大麥蟲黑頭','科普知識',0,'9-12歲','簡單','https://files.catbox.moe/b95lue.png','published','2025-10-28 19:24:16','2025-10-28 19:24:16','2025-10-28 19:24:16'),(25,'生態保育系統_雞_產物','Howard','雞的產物','科普知識',0,'9-12歲','簡單','https://files.catbox.moe/8mlsaq.png','published','2025-10-28 19:28:23','2025-10-28 19:28:23','2025-10-28 19:28:23'),(26,'生態保育系列_雞_吃','Howard','雞吃飯','科普知識',0,'9-12歲','簡單','https://files.catbox.moe/ogmfpy.png','published','2025-10-28 19:30:51','2025-10-28 19:30:51','2025-10-28 19:30:51'),(27,'生態教育教材_雞_叫','Howard','雞叫','科普知識',0,'9-12歲','簡單','https://files.catbox.moe/nsf9qh.png','published','2025-10-28 19:35:33','2025-10-28 19:35:33','2025-10-28 19:35:33'),(28,'生態教育教材_牛_產物','Howard','牛的產物','科普知識',0,'9-12歲','簡單','https://files.catbox.moe/yumd6y.png','published','2025-10-28 19:37:49','2025-10-28 19:37:49','2025-10-28 19:37:49'),(29,'測試用教材','鄭阿志','','童話故事',0,'3-6歲','簡單','https://files.catbox.moe/yxjo2t.png','published','2025-10-29 23:38:28','2025-10-29 23:38:28','2025-10-29 23:38:28');
/*!40000 ALTER TABLE `books` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hotspots`
--

DROP TABLE IF EXISTS `hotspots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hotspots` (
                            `id` int NOT NULL AUTO_INCREMENT,
                            `book_id` int NOT NULL COMMENT '教材ID',
                            `label` varchar(100) NOT NULL COMMENT '熱區標籤',
                            `x` int NOT NULL COMMENT 'X座標',
                            `y` int NOT NULL COMMENT 'Y座標',
                            `width` int NOT NULL COMMENT '寬度',
                            `height` int NOT NULL COMMENT '高度',
                            `audio_url` varchar(500) DEFAULT NULL COMMENT '音訊URL',
                            `sort_order` int DEFAULT '0' COMMENT '排序順序',
                            `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
                            PRIMARY KEY (`id`),
                            KEY `idx_book_id` (`book_id`),
                            CONSTRAINT `hotspots_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='熱區表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hotspots`
--

LOCK TABLES `hotspots` WRITE;
/*!40000 ALTER TABLE `hotspots` DISABLE KEYS */;
INSERT INTO `hotspots` VALUES (17,14,'熱區 1',254,71,110,119,'https://files.catbox.moe/f0s6ov.wav',1,'2025-10-25 12:33:42'),(19,16,'大隻的雞',400,203,176,387,'https://files.catbox.moe/pbcgry.wav',1,'2025-10-26 12:21:46'),(20,16,'小狗',110,310,224,220,'https://files.catbox.moe/0btioc.wav',2,'2025-10-26 12:21:47'),(21,16,'小貓咪',33,14,267,277,'https://files.catbox.moe/qacgq2.wav',3,'2025-10-26 12:21:47'),(23,18,'雞',103,0,489,565,'https://files.catbox.moe/j5hvc1.MP3',1,'2025-10-28 11:05:12'),(25,20,'牛',11,39,538,454,'https://files.catbox.moe/tvvrs0.MP3',1,'2025-10-28 11:08:26'),(26,21,'熱區 1',0,28,572,521,'https://files.catbox.moe/l639ja.MP3',1,'2025-10-28 11:09:39'),(27,22,'雞_飛行',19,6,516,524,'https://files.catbox.moe/j5hvc1.MP3',1,'2025-10-28 11:13:34'),(28,23,'牛_吃東西',66,23,483,476,'https://files.catbox.moe/tvvrs0.MP3',1,'2025-10-28 11:16:03'),(29,24,'大麥蟲_黑',21,45,575,422,'https://files.catbox.moe/l639ja.MP3',1,'2025-10-28 11:24:16'),(30,25,'雞的產物',3,107,577,383,'https://files.catbox.moe/j5hvc1.MP3',1,'2025-10-28 11:28:22'),(31,26,'雞_吃',10,17,582,526,'https://files.catbox.moe/j5hvc1.MP3',1,'2025-10-28 11:30:50'),(32,27,'雞_叫',96,69,398,481,'https://files.catbox.moe/j5hvc1.MP3',1,'2025-10-28 11:35:33'),(33,28,'牛的產物',91,15,460,526,'https://files.catbox.moe/tvvrs0.MP3',1,'2025-10-28 11:37:49'),(34,29,'熱區 1',48,65,220,220,'https://files.catbox.moe/qacgq2.wav',1,'2025-10-29 15:38:27'),(35,29,'熱區 2',376,278,200,200,'https://files.catbox.moe/3jdx6k.wav',2,'2025-10-29 15:38:28');
/*!40000 ALTER TABLE `hotspots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student` (
                           `id` int NOT NULL AUTO_INCREMENT,
                           `name` varchar(50) NOT NULL,
                           `email` varchar(100) NOT NULL,
                           `age` int DEFAULT NULL,
                           PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES (1,'Alice Lin','alice.lin@example.com',20),(2,'Bob Chen','bob.chen@example.com',22),(3,'Cathy Wang','cathy.wang@example.com',19),(4,'David Liu','david.liu@example.com',23),(5,'Ella Huang','ella.huang@example.com',21),(6,'Frank Wu','frank.wu@example.com',24),(7,'Grace Tsai','grace.tsai@example.com',18),(8,'Henry Chang','henry.chang@example.com',25),(9,'Ivy Yang','ivy.yang@example.com',20),(10,'Jack Hsu','jack.hsu@example.com',22),(11,'Bob Chen','bobbb.chen@example.com',0);
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
                         `id` bigint NOT NULL AUTO_INCREMENT,
                         `name` varchar(255) DEFAULT NULL,
                         `address` varchar(255) DEFAULT NULL,
                         `identity_number` varchar(255) DEFAULT NULL,
                         `password` varchar(255) NOT NULL,
                         `role` enum('admin','landlord','tenant') NOT NULL,
                         `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
                         `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
                         `landlord_id` bigint DEFAULT NULL,
                         `is_currently_residing` tinyint(1) NOT NULL DEFAULT '1',
                         `avatar` varchar(255) DEFAULT NULL,
                         PRIMARY KEY (`id`),
                         KEY `fk_landlord` (`landlord_id`),
                         CONSTRAINT `FK3eywxgg0qfx2w05xgvhqgdhrc` FOREIGN KEY (`landlord_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (68,'鄭阿志','台北市中山區南京東路100號','admin','admin','admin','2025-10-19 17:36:57','2025-10-19 17:36:57',NULL,1,'https://files.catbox.moe/nepdwg.jpg'),(69,'陳美麗','高雄市苓雅區三多一路200號','B987654321','admin002','admin','2025-10-19 17:36:57','2025-10-19 17:36:57',NULL,1,'https://i.pravatar.cc/150?img=12'),(70,'林志豪','台中市西屯區文心路300號','C135792468','admin003','admin','2025-10-19 17:36:57','2025-10-19 17:36:57',NULL,1,'https://i.pravatar.cc/150?img=13'),(71,'張雅婷','新北市板橋區文化路400號','D246813579','admin004','admin','2025-10-19 17:36:57','2025-10-19 17:36:57',NULL,1,'https://i.pravatar.cc/150?img=14'),(72,'李國華','桃園市中壢區中正路500號','E112233445','admin005','admin','2025-10-19 17:36:57','2025-10-19 17:36:57',NULL,1,'https://i.pravatar.cc/150?img=15'),(73,'吳俊凱','台南市東區長榮路600號','F556677889','admin006','admin','2025-10-19 17:36:57','2025-10-19 17:36:57',NULL,1,'https://i.pravatar.cc/150?img=16'),(74,'黃怡君','彰化縣員林市中山路700號','G998877665','admin007','admin','2025-10-19 17:36:57','2025-10-19 17:36:57',NULL,1,'https://i.pravatar.cc/150?img=17'),(75,'趙建宏','新竹市東區光復路800號','H554433221','admin008','admin','2025-10-19 17:36:57','2025-10-19 17:36:57',NULL,1,'https://i.pravatar.cc/150?img=18'),(76,'劉慧玲','嘉義市西區民族路900號','I667788990','admin009','admin','2025-10-19 17:36:57','2025-10-19 17:36:57',NULL,1,'https://i.pravatar.cc/150?img=19'),(77,'簡志誠','花蓮縣花蓮市中華路1000號','J112358132','admin010','admin','2025-10-19 17:36:57','2025-10-19 17:36:57',NULL,1,'https://i.pravatar.cc/150?img=20');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 21:42:25
