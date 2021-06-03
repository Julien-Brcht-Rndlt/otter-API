CREATE DATABASE otters CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE otters;

CREATE TABLE otter(
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `being` VARCHAR(50) NOT NULL,
    `about` TEXT NULL,
    `weight` DECIMAL NULL,
    `cubs` INT NULL,
    `url` VARCHAR(150) NULL,
    PRIMARY KEY(`id`)
);

INSERT INTO otter (`name`, `being`, `about`, `weight`, `cubs`, `url`) VALUES 
('Alfred', 'focused', null, 21.0, 0, 'https://imgur.com/a/e7hmF1l'),
('Suzette', 'nosy', null, 14.5, 2, 'https://imgur.com/a/WVyD0oi'),
('Jane', 'wetty', null, 19.3, 3, 'https://imgur.com/a/Se5uOLP'),
('Henry', 'hungry', null, 29.4, 1, 'https://imgur.com/a/32NJjVE'),
('George', 'swimming', null, 24.0, 0, 'https://imgur.com/a/YkDZSMg'),
('Oliver', 'secret', null, 16.4, 4, 'https://imgur.com/a/DUq94YI');