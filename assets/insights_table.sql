DROP TABLE IF EXISTS `insights`;

CREATE TABLE `insights` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `page_id` varchar(20) NOT NULL,
  `page_name` varchar(100) NOT NULL,
  `page_actions_post_reactions_like_total` int(11) NOT NULL,
  `page_impressions` int(11) NOT NULL,
  `page_consumptions` int(11) NOT NULL,
  `page_engaged_users` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQUE_COUPLE` (`page_id`,`date`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
