$(function(){
	var BookModel = Backbone.Model.extend({
		defaults: {
			id: 0,
			title: "empty-title",
			author: "no-author",
			meta: 99999
		}
	});

	var BookModelCollection = Backbone.Collection.extend({
		model: BookModel,

		sortKey: 'id',
		sortDirection: 1,

		comparator: function(a, b){
			var a = a.get(this.sortKey);
			var b = b.get(this.sortKey);

			// Don't sort if both values are the same
			if(a == b) return 0;

			// When the sort direction is ascending
			if(this.sortDirection == 1){
				// Sort a before b
				return a > b ? 1 : -1;
			}
			else{
				// Sort b before a
				return a < b ? 1 : -1;
			}
		},

		sortByField: function(field){
			this.sortKey = field;
			this.sort();
		}
	});

	var BookModelView = Backbone.View.extend({
		tagName: "tr",

		template: _.template($("#row-template").html()),

		initialize: function(){
			_.bindAll(this, "render");
		},

		render: function(){
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		}
	});

	var AppView = Backbone.View.extend({
		// Append the view to the div id as bookCollectionApp
		el: $("#bookCollectionApp"),

		events: {
			"change #booksShownSelect": "onBooksShownChange",
			"click #previousPageBtn": "onPrevPageClick",
			"click #nextPageBtn": "onNextPageClick",
			"click #booknameImg": "onBooknameImgClick",
			"click #authorImg": "onAuthorImgClick",
			"click #metaImg": "onMetaImgClick"
		},

		initialize: function() {
			_.bindAll(this, "render");

			// Append elements in the HTML for later use
			this.numBooksSelect = $("#booksShownSelect");
			this.bookTable = $("#bookTable");
			this.numIndicator = $("#numberIndicator");
			this.prevPageBtn = $("#previousPageBtn");
			this.nextPageBtn = $("#nextPageBtn");
			this.pageNum = 0;
			this.maxPages = 0;

			// Get the collection of books as a collection modeled after BookModel
			this.collection = new BookModelCollection(books);
			this.listenTo(this.collection, "sort", this.render);
			this.render();
		},

		render: function(){
			// Store a ref to the object in the callback
			var self = this;
			// Remove the tbody of the book table before populating with elements
			this.bookTable.children("tbody").remove();
			// Check if the collection has members
			if(this.collection.length){
				this.maxPages = Math.floor(this.collection.size() / this.numBooksSelect.val());
				if(this.collection.size() % this.numBooksSelect.val() === 0) {
					this.maxPages--;
				}

				// Disable the previous page buttons when we are on the first page
				this.prevPageBtn.prop("disabled", (this.pageNum <= 0));
				// Disable the next page buttons when we are on the last page
				this.nextPageBtn.prop("disabled", (this.pageNum >= this.maxPages));

				console.log("There are elements in this collection");
				// Get the first and last entries of the displayed subcollection
				var firstEntry = this.pageNum * this.numBooksSelect.val();
				var lastEntry = firstEntry + parseInt(this.numBooksSelect.val());
				if(lastEntry > this.collection.length){
					lastEntry = this.collection.length;
				}

				// Create a new subcollection based on the first and last entries
				var subcollection = new BookModelCollection(this.collection.slice(firstEntry, lastEntry), {sort: false});
				console.log(subcollection);

				// Iterate through the sub-collection and append the collection to the HTML
				subcollection.each(function(book){
					self.appendBook(book);
				}, this);
				this.numIndicator.html((firstEntry + 1) + " - " + lastEntry + " of " + this.collection.size());
			} else {
				this.numIndicator.html("None");
				this.prevPageBtn.prop("disabled", true);
				this.nextPageBtn.prop("disabled", true);
			}
		},

		appendBook: function(book){
			var bookView = new BookModelView({
				model: book
			});
			this.bookTable.append(bookView.render().el);
		},

		resetSortingImg: function(htmlElement){
			$(".sortImg").not(htmlElement).attr("src", "/assets/images/sort_both.png");
		},

		changeSortOrder: function(htmlElement){
			this.pageNum = 0;
			if(htmlElement.attr("src") === "/assets/images/sort_asc.png"){
				htmlElement.attr("src", "/assets/images/sort_desc.png");
				this.collection.sortDirection = -1;
			} else {
				htmlElement.attr("src", "/assets/images/sort_asc.png");
				this.collection.sortDirection = 1;
			}
		},

		// Putting event methods down here separate from the other methods
		onBooksShownChange: function(){
			this.pageNum = 0;
			console.log("Number of books shown is " + this.numBooksSelect.val());
			this.render();
		},

		onPrevPageClick: function(){
			if(this.pageNum > 0){
				this.pageNum--;
				console.log("Going to page " + this.pageNum);
				this.render();
			}
		},

		onNextPageClick: function(){
			if(this.pageNum < this.maxPages){
				this.pageNum++;
				console.log("Going to page " + this.pageNum);
				this.render();
			}
		},

		onBooknameImgClick: function(){
			console.log("Sorting by book name");
			this.resetSortingImg($("#booknameImg"));
			this.changeSortOrder($("#booknameImg"));
			this.collection.sortByField("title");
		},

		onAuthorImgClick: function(){
			console.log("Sorting by author");
			this.resetSortingImg($("#authorImg"));
			this.changeSortOrder($("#authorImg"));
			this.collection.sortByField("author");
			this.render();
		},

		onMetaImgClick: function(){
			console.log("Sorting by meta");
			this.resetSortingImg($("#metaImg"));
			this.changeSortOrder($("#metaImg"));
			this.collection.sortByField("meta");
			console.log(this.collection.sort);
			this.render();
		}
	});

	var app = new AppView;
});