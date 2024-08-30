-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 08, 2024 at 08:43 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `webt_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `recommendations`
--

CREATE TABLE `recommendations` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `recommendation` varchar(10000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `recommendations`
--

INSERT INTO `recommendations` (`id`, `first_name`, `last_name`, `recommendation`) VALUES
(1, 'Alex', 'Johnson', 'I had the pleasure of working with Andrea Megan Sustic for three years at TechSolutions Inc., during which they were an IT Project Manager. Their expertise in managing complex IT projects was invaluable. They consistently demonstrated strong technical skills and a deep understanding of cybersecurity, leading to the successful completion of numerous projects. I highly recommend Andrea for any position requiring IT expertise and a strong, reliable work ethic.'),
(2, 'Chris', 'Robinson', 'Alongside Andrea\'s professional talents, they have an extraordinary ability to recite the entire first chapter of \'Harry Potter\' by heart. This unique skill has been a delightful addition to our office culture, providing entertainment and a touch of magic during our team gatherings.'),
(3, 'Dr. Maya', 'Patel', 'As the Chief Technology Officer at CyberSecure Inc., I can attest to Andrea\'s exceptional skills in cybersecurity. During her tenure here, she played a crucial role in enhancing our network security and responding to cyber threats effectively. Andrea possesses a rare combination of technical proficiency and strategic thinking that makes her an asset to any team focused on digital security.'),
(4, 'Jamie ', 'Lee', 'I\'m writing to recommend Andrea Megan Sustic not just for her outstanding professional skills, but also for her unmatched karaoke abilities. Whether it\'s a team-building night out or a company party, Andrea\'s karaoke performances are legendary, lifting team morale and fostering a fun, inclusive environment.');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `recommendations`
--
ALTER TABLE `recommendations`
  ADD UNIQUE KEY `id` (`id`) USING BTREE;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `recommendations`
--
ALTER TABLE `recommendations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
