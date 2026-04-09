using CORE.APP.Domain;

namespace Books.APP.Domain;

public class BookGenre: Entity 

{
public int BookId {get; set;}    

//NAV PROP

public Book Book {get; set;}
public int GenreId {get; set;}

//nav prop
public Genre Genre {get; set;}

}