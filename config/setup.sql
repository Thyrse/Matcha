CREATE DATABASE IF NOT EXISTS matcha_db_b;

USE matcha_db_b;

CREATE TABLE IF NOT EXISTS `gender` (
			`id` INT AUTO_INCREMENT PRIMARY KEY, 
			`description` VARCHAR(255) NOT NULL 
			);

CREATE TABLE IF NOT EXISTS `orientation` (
			`id` INT AUTO_INCREMENT PRIMARY KEY, 
			`description` VARCHAR(255) NOT NULL 
			);

CREATE TABLE IF NOT EXISTS `users` ( 
			`id` SERIAL PRIMARY KEY,
			`username` VARCHAR(150) NOT NULL,
			`password` VARCHAR(150) NOT NULL,
			`email` varchar(255) NOT NULL, 
			`first_name` VARCHAR(255) NOT NULL,
			`last_name` VARCHAR(255) NOT NULL,
			`creation_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			`last_login` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `gender_id` INT DEFAULT 1,
            `orientation_id` INT DEFAULT 3,
			`popularity` INT UNSIGNED DEFAULT 50,
            `bio` VARCHAR (500),
			`birthday` DECIMAL DEFAULT 18,
			`latitude` FLOAT DEFAULT NULL,
			`longitude` FLOAT DEFAULT NULL,
			`token` VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL,
			`reset` VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL,
			`valid` TINYINT(1) NOT NULL DEFAULT 0,
			`complete` TINYINT(1) NOT NULL DEFAULT 0,
			`complete_image` TINYINT(1) NOT NULL DEFAULT 0,
            FOREIGN KEY (gender_id) REFERENCES gender (id),
            FOREIGN KEY (orientation_id) REFERENCES orientation (id)
		);

    
CREATE TABLE IF NOT EXISTS `image` ( 
			`id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
			`user_id` VARCHAR(150) NOT NULL, 
			`image_name` VARCHAR(255) NOT NULL, 
			`creation_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			`main_image` INT DEFAULT 0
		);

CREATE TABLE IF NOT EXISTS `tags` (
			`user_id` SERIAL PRIMARY KEY,
			`vegan` tinyint(1) NOT NULL DEFAULT 0,
			`fitness` tinyint(1) NOT NULL DEFAULT 0,
			`netflix` tinyint(1) NOT NULL DEFAULT 0,
			`party` tinyint(1) NOT NULL DEFAULT 0,
			`nature` tinyint(1) NOT NULL DEFAULT 0,
			FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS `likes` (
			`id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
            `user_liked` INT NOT NULL,
			`user_emit` INT NOT NULL
);

CREATE TABLE IF NOT EXISTS `nopes` (
			`id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
            `user_noped` INT NOT NULL,
			`user_emit` INT NOT NULL
);

CREATE TABLE IF NOT EXISTS `block` (
			`id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
            `user_blocked` INT NOT NULL,
			`user_emit` INT NOT NULL
);

CREATE TABLE IF NOT EXISTS `reported` (
			`id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
            `user_reported` INT NOT NULL,
			`user_emit` INT NOT NULL
);

CREATE TABLE IF NOT EXISTS `matchs` (
			`id_match` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
            `user_1` INT NOT NULL,
			`user_2` INT NOT NULL
);

CREATE TABLE IF NOT EXISTS `chat_msg` (
			`id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
			`id_room` INT UNSIGNED NOT NULL, 
            `message` VARCHAR (500) COLLATE utf8mb4_general_ci NOT NULL,
			`user_id` INT NOT NULL,
            FOREIGN KEY (id_room) REFERENCES matchs (id_match) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `events` (
  			`id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
  			`description` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
);

CREATE TABLE IF NOT EXISTS `compatibility` (
			`user_id` int(10) NOT NULL,
			`target_id` int(10) NOT NULL,
			`attraction` tinyint(1),
			`distance` INT UNSIGNED,
			`interests` INT UNSIGNED,
			`viewable` tinyint(1)
);

CREATE TABLE IF NOT EXISTS `notifications` (
			`id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
			`type` VARCHAR (500) NOT NULL,
			`user_id` INT UNSIGNED,
			`watched` TINYINT(1) NOT NULL DEFAULT 0
);

/* creation de quelques enregistrements en bdd */
INSERT INTO gender (description) VALUES ('Man');
INSERT INTO gender (description) VALUES ('Woman');

INSERT INTO orientation (description) VALUES ('Straight');
INSERT INTO orientation (description) VALUES ('Gay');
INSERT INTO orientation (description) VALUES ('Bisexual');

INSERT INTO events (description) VALUES ('View');
INSERT INTO events (description) VALUES ('Like');
INSERT INTO events (description) VALUES ('Pass');
INSERT INTO events (description) VALUES ('Block');
INSERT INTO events (description) VALUES ('Report');