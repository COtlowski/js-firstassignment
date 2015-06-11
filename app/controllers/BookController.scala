package controllers

import play.api._
import play.api.mvc._
import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.libs.json.{__, Reads}
import play.Logger
import models.Book

object BookController extends Controller {

    /** List books on the webpage
    */
    def list = Action {
        Ok(Json.toJson(Book.list))
    }

    /** Controller to read a book's information
    * @param id The id number of the book
     */
    def read(id: Long) = Action {
        Ok(Json.toJson(Book.read(id)))
    }

    /** Controller to create a new book in the MySQL database
    * @return The result of creating a new book
     */
    def create = Action(parse.json) { request =>
        val body = request.body
        Logger.info(s"Body=$body")
        request.body.validate[Book].fold(
            errors => {
                BadRequest("Json request is not valid")
            },
            book => {
                Ok(Json.toJson(Book.create(book)))
            }
        )
    }

    /** Updates a book in the MySQL database
    * @param parse.json
    * @return The result of the update
     */
    def update = Action(parse.json) { request =>
        request.body.validate[Book].fold(
            errors => {
                BadRequest("Json request is not valid")
            },
            book => {
                Book.update(book).map {
                    book => Ok(Json.toJson(book))
                } getOrElse {
                    NotFound
                }
            }
        )
    }

    /** Deletes a book from the database
    * @param id Id of the book to be deleted
    * @return The status of whether the book was deleted or not
     */
    def delete(id: Long) = Action {
        if(Book.delete(id))
            Ok(Json.toJson(1))
        else
            NotFound
    }

}
