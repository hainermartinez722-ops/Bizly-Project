-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: bizly_db
-- ------------------------------------------------------
-- Server version	8.0.45

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

--
-- Temporary view structure for view `v_stock_bajo`
--

DROP TABLE IF EXISTS `v_stock_bajo`;
/*!50001 DROP VIEW IF EXISTS `v_stock_bajo`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_stock_bajo` AS SELECT 
 1 AS `id`,
 1 AS `codigo`,
 1 AS `nombre`,
 1 AS `categoria`,
 1 AS `stock_actual`,
 1 AS `stock_minimo`,
 1 AS `unidades_faltantes`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_top_productos`
--

DROP TABLE IF EXISTS `v_top_productos`;
/*!50001 DROP VIEW IF EXISTS `v_top_productos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_top_productos` AS SELECT 
 1 AS `id`,
 1 AS `nombre`,
 1 AS `codigo`,
 1 AS `categoria`,
 1 AS `total_vendido`,
 1 AS `ingresos_generados`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_ventas_diarias`
--

DROP TABLE IF EXISTS `v_ventas_diarias`;
/*!50001 DROP VIEW IF EXISTS `v_ventas_diarias`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_ventas_diarias` AS SELECT 
 1 AS `fecha`,
 1 AS `total_ventas`,
 1 AS `ingresos_totales`,
 1 AS `ticket_promedio`,
 1 AS `anuladas`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `v_stock_bajo`
--

/*!50001 DROP VIEW IF EXISTS `v_stock_bajo`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_stock_bajo` AS select `p`.`id` AS `id`,`p`.`codigo` AS `codigo`,`p`.`nombre` AS `nombre`,`c`.`nombre` AS `categoria`,`p`.`stock_actual` AS `stock_actual`,`p`.`stock_minimo` AS `stock_minimo`,(`p`.`stock_minimo` - `p`.`stock_actual`) AS `unidades_faltantes` from (`productos` `p` join `categorias` `c` on((`c`.`id` = `p`.`id_categoria`))) where ((`p`.`stock_actual` <= `p`.`stock_minimo`) and (`p`.`activo` = 1)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_top_productos`
--

/*!50001 DROP VIEW IF EXISTS `v_top_productos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_top_productos` AS select `p`.`id` AS `id`,`p`.`nombre` AS `nombre`,`p`.`codigo` AS `codigo`,`c`.`nombre` AS `categoria`,sum(`dv`.`cantidad`) AS `total_vendido`,sum(`dv`.`subtotal`) AS `ingresos_generados` from (((`detalle_ventas` `dv` join `productos` `p` on((`p`.`id` = `dv`.`id_producto`))) join `categorias` `c` on((`c`.`id` = `p`.`id_categoria`))) join `ventas` `v` on((`v`.`id` = `dv`.`id_venta`))) where (`v`.`estado` = 'completada') group by `p`.`id`,`p`.`nombre`,`p`.`codigo`,`c`.`nombre` order by `total_vendido` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_ventas_diarias`
--

/*!50001 DROP VIEW IF EXISTS `v_ventas_diarias`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_ventas_diarias` AS select cast(`v`.`created_at` as date) AS `fecha`,count(`v`.`id`) AS `total_ventas`,sum(`v`.`total`) AS `ingresos_totales`,avg(`v`.`total`) AS `ticket_promedio`,sum((case when (`v`.`estado` = 'anulada') then 1 else 0 end)) AS `anuladas` from `ventas` `v` group by cast(`v`.`created_at` as date) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-30  7:07:44
