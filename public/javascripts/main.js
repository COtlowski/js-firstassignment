$(function(){
	var BookModel = Backbone.Model.extend({
		sync: function(method, model, options) {
		    options = options || {};
		    options.url = model.methodToURL(method.toLowerCase());

		    Backbone.sync(method, model, options);
		},

		methodToURL: function(method) {
			switch(method) {
				case 'create':
					return '/books/create'; 
					break;
				case 'update':
					return '/books/update';
					break;
				case 'delete':
					return '/books/delete/' + this.get("id");
					break;
			}
		},
	});

	var BookModelCollection = Backbone.Collection.extend({
		model: BookModel,
		url: "/books/list",

		sortKey: 'id',
		sortDirection: 1,

		//localStorage: new Backbone.LocalStorage("book-list-storage"),

		comparator: function(a, b){
			var a = a.get(this.sortKey);
			var b = b.get(this.sortKey);

			// Don't sort if both values are the same
			if(a === b) 
				return 0;

			// When the sort direction is ascending
			if(this.sortDirection === 1){
				// Sort a before b
				return a > b ? 1 : -1;
			}
			else{
				// Sort b before a
				return a < b ? 1 : -1;
			}
		},

		sortByField: function(field){
			// Set the column to sort and then sort
			this.sortKey = field;
			this.sort();
		},
	});

	var BookView = Backbone.View.extend({
		tagName: "tr",

		editing: false,

		template: _.template(
			'<td><div class="view"><%- title %></div><input class="edit" type="text" value="<%- title %>" hidden/></td>' +
			'<td><div class="view"><%- author %></div><input class="edit" type="text" value="<%- author %>" hidden/></td>' +
			'<td><div class="view"><%- meta %></div><input class="edit" type="text" value="<%- meta %>" hidden/></td>' + 
			'<td>' +
				'<img class="destroyButton" id="deleteIcon" width="16" height="16" src="/assets/images/x-icon.png")"></img>' +
				'<img class="editButton" id="editIcon" width="16" height="16" src="/assets/images/pencil.png")"></img>' +
			'</td>'
		),

		events: {
			"click img.destroyButton" : "clear",
			"click img.editButton": "edit"
		},

		initialize: function(){
			_.bindAll(this, "render", "clear", "test");

			this.listenTo(this.model, "destroy", this.remove);
			this.listenTo(this.model, "sync", this.render);
		},

		render: function(){
			// Render the row based on the html template and the JSON data
			$(this.el).html(this.template(this.model.toJSON()));
			this.input = this.$('.edit');
			return this;
		},

		clear: function(){
			// Destroy the model
			this.model.destroy();
		},

		entryValidation: function(newBook) {
			var errorString = "";
			if(newBook.get("title") === ""){
				errorString += "-\tPlease enter a title\n";
			}
			if(newBook.get("author") === ""){
				errorString += "-\tPlease enter the author's name\n";
			}
			if(_.isNaN(parseInt(newBook.get("meta")))){
				errorString += "-\tPlease enter a meta number\n";
			}

			if(errorString === ""){
				return true;
			} else {
				alert("The entry has issues\n\n" + errorString);
				return false;
			}
		},

		edit: function(){
			console.log("Editing " + this.model.id);

			if(this.editing){
				this.editing = !this.editing;
				console.log(this.editing);
				$(this.el).addClass("editing");
				this.$(".view").hide();
				this.$(".edit").show();
			} else {
				var newBook = new BookModel({
					id: this.model.id,
					title: this.input[0].value,
					author: this.input[1].value,
					meta: parseInt(this.input[2].value)
				});
				if(this.entryValidation(newBook)){
					this.editing = !this.editing;
					console.log(this.editing);
					$(this.el).removeClass("editing");
					this.$(".view").show();
					this.$(".edit").hide();
					this.model.save(newBook);
					this.render();
				}
			}
		},

		close: function(){
			$(this.el).removeClass("editing");
		},

		test: function() {console.log("deleted " + this.model)}
	});

	var AppView = Backbone.View.extend({
		// Append the view to the div id as bookCollectionApp
		el: $("#bookCollectionApp"),

		events: {
			"change #booksShownSelect": "onBooksShownChange",
			"click #previousPageBtn": "onPrevPageClick",
			"click #nextPageBtn": "onNextPageClick",
			"click #booknameHead": "onBooknameImgClick",
			"click #authorHead": "onAuthorImgClick",
			"click #metaHead": "onMetaImgClick",
			"click #bookEntryBtn": "onBookEntryClick",
		},

		initialize: function() {
			_.bindAll(this, "render", "clearEntryFields");

			// Append elements in the HTML for later use
			this.numBooksSelect = $("#booksShownSelect");
			this.bookTable = $("#bookTable");
			this.numIndicator = $("#numberIndicator");
			this.prevPageBtn = $("#previousPageBtn");
			this.nextPageBtn = $("#nextPageBtn");
			this.pageNum = 0;
			this.maxPages = 0;

			// Get the collection of books as a collection modeled after BookModel
			this.collection = new BookModelCollection();
			this.collection.fetch();
			//this.counter = this.collection.last().id;

			// Set up listeners for events
			this.listenTo(this.collection, "sort", this.render);
			this.listenTo(this.collection, "remove", this.render);

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

				// Check if the current page is over the maximum pages
				if(this.pageNum > this.maxPages){
					this.pageNum = this.maxPages;
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
			// Create a new BookView based on the model
			var bookView = new BookView({
				model: book
			});
			// Append the BookView render to the table
			this.bookTable.append(bookView.render().el);
		},

		resetSortingImg: function(selectedColumn){
			// With the exception of the selected sort, reset the other sorting icons
			$(".sortImg").not(selectedColumn).attr("src", "/assets/images/sort_both.png");
		},

		changeSortOrder: function(selectedColumn){
			// Reset the page to the first one
			this.pageNum = 0;
			// Change the image based on columns sorting image
			if(selectedColumn.attr("src") == "/assets/images/sort_asc.png"){
				selectedColumn.attr("src", "/assets/images/sort_desc.png");
				this.collection.sortDirection = -1;
			} else {
				selectedColumn.attr("src", "/assets/images/sort_asc.png");
				this.collection.sortDirection = 1;
			}
		},

		clearEntryFields: function() {
			console.log("Cleared book entry fields");
			$("#titleBox").val("");
			$("#authorBox").val("");
			$("#metaBox").val("");
		},

		entryValidation: function(newBook) {
			var errorString = "";
			if(newBook.get("title") === ""){
				errorString += "-\tPlease enter a title\n";
			}
			if(newBook.get("author") === ""){
				errorString += "-\tPlease enter the author's name\n";
			}
			if(_.isNaN(parseInt(newBook.get("meta")))){
				errorString += "-\tPlease enter a meta number\n";
			}

			if(errorString === ""){
				return true;
			} else {
				alert("The entry has issues\n\n" + errorString);
				return false;
			}
		},

		// Putting event methods down here separate from the other methods
		onBooksShownChange: function(){
			// Reset to first page and re-render
			this.pageNum = 0;
			this.render();
		},

		onPrevPageClick: function(){
			// Check if we are not on the first page
			if(this.pageNum > 0){
				// Decreament the page
				this.pageNum--;
				console.log("Going to page " + this.pageNum);
				this.render();
			}
		},

		onNextPageClick: function(){
			// Check if we are not on the last page
			if(this.pageNum < this.maxPages){
				// Increament the page
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
		},

		onMetaImgClick: function(){
			console.log("Sorting by meta");
			this.resetSortingImg($("#metaImg"));
			this.changeSortOrder($("#metaImg"));
			this.collection.sortByField("meta");
		},

		onBookEntryClick: function(){
			this.counter++;
			var newBook = new BookModel();
			newBook.set({
				title: $("#titleBox").val(),
				author: $("#authorBox").val(),
				meta: parseInt($("#metaBox").val())
			});
			if(this.entryValidation(newBook)){
				console.log("Entering Book: " + newBook.get("title") + " by " + 
					newBook.get("author") + ": " + newBook.get("meta"));

				this.collection.create(newBook);

				this.clearEntryFields();
				
				this.render();
			}
		},

		test: function() {console.log("help")},
	});

	var app = new AppView;
});