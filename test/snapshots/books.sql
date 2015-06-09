
# --- !Ups

INSERT INTO `books` (`id`, `title`, `author`, `meta`) VALUES 
(1, 'Brave New World', 'Aldous Huxley', 34503),
(2, 'New Moon', 'Stephenie Meyer', 33785),
(3, 'Angels & Demons', 'Dan Brown', 33408),
(4, 'The Curious Incident of the Dog in the Night-Time', 'Mark Haddon', 32866),
(5, 'Life of Pi', 'Yann Martel', 32101),
(6, 'The Fellowship of the Ring', 'J. R. R. Tolkien', 32067),
(7, 'Wuthering Heights', 'Emily Brontë', 31649),
(8, 'Fahrenheit 451', 'Ray Bradbury', 31503);

# --- !Downs

DELETE FROM `books`;
ALTER TABLE `books` AUTO_INCREMENT = 1;
