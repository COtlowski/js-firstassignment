package models

import anorm._
import anorm.SqlParser._
import play.api.Play.current
import play.api.db.DB
import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.libs.json.{__, Reads}

case class Book(id: Option[Long], title: String, author: String, meta: Int)

object Book {

    implicit val writesBook = Writes[Book] {
        case Book(id, title, author, price) =>
            Json.obj(
                "id" -> id,
                "title" -> title,
                "author" -> author,
                "meta" -> price
            )
    }

    implicit val readsBook: Reads[Book] = (
        (JsPath \ "id").readNullable[Long] and
        (JsPath \ "title").read[String] and
        (JsPath \ "author").read[String] and
        (JsPath \ "meta").read[Int]
    )(Book.apply _)

    val parser: RowParser[Book] = {
        get[Option[Long]]("books.id") ~
        get[String]("books.title") ~
        get[String]("books.author") ~
        get[Int]("books.meta") map { case id~title~author~meta =>
            Book(id, title, author, meta)
        }
    }

    /** Lists all books. */
    def list: List[Book] = {
        DB.withConnection { implicit c =>
            SQL("SELECT * FROM books").as(parser.*)
        }
    }

    /** Reads a book from the database by its id.
     *  @param id The ID of the book we want to find.
     *  @return The book if it exists, or None, if not.
     *  @note similar to list, but with slightly different result set parser
     */
    def read(id: Long): Option[Book] = {
        DB.withConnection { implicit c => 
            SQL("SELECT * FROM books WHERE id = {id}")
                .on("id" -> id).as(parser.singleOpt)
        }
    }

    /** Creates a new book and returns it, if successful.
     *  @param book The book we want to create.
     *  @return The created book with its new id if successful, otherwise None.
     *  @note SQL(...).on(...).executeInsert()
     */
     def create(book: Book): Option[Book] = {
        DB.withConnection { implicit c =>
            SQL("INSERT INTO books(title, author, meta) values ({title}, {author}, {meta})")
            .on(
                "title" -> book.title,
                "author" -> book.author,
                "meta" -> book.meta
                ).executeInsert()
            .map(id => book.copy(id = Some(id)))
        }
    }

    /** Updates a book and returns it if successful.
     *  @param book The book we want to update (should have an id).
     *  @return The updated book if successful, otherwise None.
     *  @note SQL(...).on(...).executeUpdate()
     */
    def update(book: Book): Option[Book] = {
        DB.withConnection { implicit c =>
            SQL("""UPDATE books 
                SET title={title}, author={author}, meta={meta} 
                WHERE id={id}""")
                .on("title" -> book.title, "author" -> book.author,
                "meta" -> book.meta, "id" -> book.id)
                .executeUpdate() match {
                    case 0 => None
                    case _ => Some(book)
                }
        }
    }

    /** Deletes a book by id.
     *  @param id The ID of the book we want to delete.
     *  @return true if the book was deleted, or false otherwise.
     *  @note SQL(...).on(...).executeUpdate()
     */
    def delete(id: Long): Boolean = {
        DB.withConnection { implicit c =>
            SQL("DELETE FROM books WHERE id={id}").on("id" -> id).executeUpdate() > 0
        }
    }

    def empty: Book = Book(None, "", "", 0)
}
