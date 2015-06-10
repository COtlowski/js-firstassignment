package test.unit.models

import play.api.test._
import play.api.test.Helpers._
import com.jaroop.play.test.WithSQL
import org.specs2.mutable._
import models.Book

object BookSpec extends Specification {

    "The Book model" should {

        tag("list")
        "list 8 books" in new WithSQL("test/snapshots/books.sql") {
            val books: List[Book] = Book.list
            books must have size(8)
            books.flatMap(book => book.id) must contain(exactly(1L, 2L, 3L, 4L, 5L, 6L, 7L, 8L))
        }

        tag("list")
        "list no books when the database is empty" in new WithApplication {
            Book.list must have size(0)
        }

        tag("read")
        "find a book by id" in new WithSQL("test/snapshots/books.sql"){
            val book: Option[Book] = Book.read(4L)
            book must beSome
            book.flatMap(_.id) must beSome(4L)
        }

        tag("read")
        "return None for a book that does not exist" in new WithSQL("test/snapshots/books.sql"){
            val book: Option[Book] = Book.read(10L)
            book must beNone
            book.map(_.title) must beNone
        }

        tag("create")
        "create a new book and return the correct id" in new WithSQL("test/snapshots/books.sql"){
            val book = Book.create(Book.empty.copy(title = "The Grapes of Wrath", 
                author = "John Steinbeck", meta = 90990))
            book.flatMap(_.id) must beSome(9L)
        }

        tag("update")
        "update a book successfully and return it" in new WithSQL("test/snapshots/books.sql"){
            val updatedBook = Book.update(Book.empty.copy(title = "The Grapes of Wrath",
                author = "John Steinbeck", meta = 90990, id = Some(6L)))
            updatedBook must beSome
        }

        tag("update")
        "fail to update a book that does not exist" in new WithSQL("test/snapshots/books.sql"){
            val updatedBook = Book.update(Book.empty.copy(title = "The Grapes of Wrath",
                author = "John Steinbeck", meta = 90990, id = None))
            updatedBook must beNone
        }

        tag("delete")
        "delete a book and return true" in new WithSQL("test/snapshots/books.sql"){
            val deleteSuccessful = Book.delete(4L)
            deleteSuccessful must beTrue
        }

        tag("delete")
        "return false when deleting a book that does not exist" in new WithSQL("test/snapshots/books.sql"){
            val deleteSuccessful = Book.delete(11L)
            deleteSuccessful must beFalse
        }

    }

}
