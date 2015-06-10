package test.unit.controllers

import play.api.test._
import play.api.test.Helpers._
import play.Logger
import com.jaroop.play.test.WithSQL
import org.specs2.mutable._
import controllers.BookController
import models.Book

object BookControllerSpec extends Specification {

    "The Book controller" should {

        tag("list")
        "list 8 books" in new WithSQL {
            val expectedBooks = Book.list
            val request = FakeRequest(GET, "/books/list")
            val Some(result) = route(request)
            // OR
            // val result = BookController.list(request)
            status(result) must equalTo(OK)
            contentAsJson(result).as[List[Book]] must equalTo(expectedBooks)
        }

        tag("list")
        // "get no list" in new WithSQL {
        //     val expectedBooks = Book.list
        //     val request = FakeRequest(GET, "/books")
        //     val Some(result) = route(request)
        //     status(result) must equalTo(OK)
        //     contentAsJson(result).as[List[Book]] must equalTo(expectedBooks)
        // }

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
            val request = FakeRequest(GET, "/books/read/10")
            val Some(result) = route(request)
            status(result) must equalTo(OK)
            contentAsJson(result).as[Option[Book]] must beNone
        }

        // tag("create")
        // "create a new book "
    }

}