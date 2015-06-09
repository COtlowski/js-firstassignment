# --- !Ups

CREATE TABLE IF NOT EXISTS `books` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `author` VARCHAR(255) NOT NULL,
    `meta` INT(11) NOT NULL,
    PRIMARY KEY(`id`)
);

# --- !Downs

DROP TABLE IF EXISTS `books`;