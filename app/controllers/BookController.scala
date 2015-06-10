package controllers

import play.api._
import play.api.mvc._
import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.libs.json.{__, Reads}
import models.Book

object BookController extends Controller {

    /** List books on the webpage*/
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
    * @param json The model in JSON form
     */
    def create = Action(parse.json) { request =>
        request.body.validate[Book].fold(
            errors => {
                BadRequest("Json request is not valid")
            },
            book => {
                Ok(Json.toJson(Book.create(book)))
            }
        )
    }

    /** 
    *
    *
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

    /** 
    *
    *
     */
    def delete(id: Long) = Action { 
        if(Book.delete(id))
            Ok(Json.toJson(1))
        else
            NotFound
    }

}
