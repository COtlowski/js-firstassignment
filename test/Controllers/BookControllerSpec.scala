package test.unit.controllers

import play.api.test._
import play.api.test.Helpers._
import play.Logger
import play.api.libs.json._
import com.jaroop.play.test.WithSQL
import org.specs2.mutable._
import controllers.BookController
import models.Book

object BookControllerSpec extends Specification {

    "The Book controller" should {

        tag("list")
        "list 8 books" in new WithSQL("test/snapshots/books.sql") {
            val expectedBooks = Book.list
            val request = FakeRequest(GET, "/books/list")
            val Some(result) = route(request)
            status(result) must equalTo(OK)
            val jsonResult = contentAsJson(result).as[List[Book]]
            jsonResult must equalTo(expectedBooks)
            jsonResult.flatMap(_.id) must contain(exactly(1L, 2L, 3L, 4L, 5L, 6L, 7L, 8L))
        }

        tag("list")
        "get no list" in new WithSQL {
            val request = FakeRequest(GET, "/books/list")
            val Some(result) = route(request)
            status(result) must equalTo(OK)
            contentAsJson(result).as[List[Book]] must have size (0)
        }

        tag("read")
        "find a book by id" in new WithSQL("test/snapshots/books.sql") {

            val expectedBook = Book.read(4L)
            val request = FakeRequest(GET, "/books/read/4")
            val Some(result) = route(request)
            status(result) must equalTo(OK)
            contentAsJson(result).as[Option[Book]] must equalTo(expectedBook)
        }

        tag("read")
        "don't find a book with an id" in new WithSQL("test/snapshots/books.sql"){
            val request = FakeRequest(GET, "/books/read/20")
            val Some(result) = route(request)
            status(result) must equalTo(OK)
            contentAsJson(result).as[Option[Book]] must beNone
        }

        tag("create")
        "create a book" in new WithSQL("test/snapshots/books.sql"){
            val newBook = Book.empty.copy(
                title = "The Grapes of Wrath",
                author = "John Steinbeck",
                meta = 90990
            )
                       
            val request = FakeRequest(POST, "/books/create").withJsonBody(
                Json.toJson(newBook)
            )
            val Some(result) = route(request)
            status(result) must equalTo(OK)
            contentAsJson(result).as[Option[Book]].flatMap(_.id) must beSome(9L)
            Book.list must have size(9)
        }

        tag("update")
        "update a book" in new WithSQL("test/snapshots/books.sql"){
            val originalBook = Book.list(1).copy()
            val book = Book.list(1).copy(
                title = "The Grapes of Wrath",
                author = "John Steinbeck",
                meta = 90990
            )

            val request = FakeRequest(GET, "/books/update").withJsonBody(
                Json.toJson(book)
            )
            val Some(result) = route(request)
            status(result) must equalTo(OK)
            contentAsJson(result).as[Book] must not equalTo(originalBook)
        }

        tag("update")
        "failed to update a book that doesnt exist" in new WithSQL("test/snapshots/books.sql"){
            val book = Book.list(1).copy(
                id = Some(20L),
                title = "The Grapes of Wrath",
                author = "John Steinbeck",
                meta = 90990
            )
            val request = FakeRequest(GET, "/books/update").withJsonBody(
                Json.toJson(book)
            )
            val Some(result) = route(request)
            status(result) must equalTo(404)
        }

        tag("delete")
        "delete a book" in new WithSQL("test/snapshots/books.sql"){
            val request = FakeRequest(DELETE, "/books/delete/1")
            val Some(result) = route(request)
            status(result) must equalTo(OK)
        }

        tag("delete")
        "delete a book that doesn't exist" in new WithSQL("test/snapshots/books.sql"){
            val request = FakeRequest(DELETE, "/books/delete/10")
            val Some(result) = route(request)
            status(result) must equalTo(404)
        }
    }

}