using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CORE.APP.Domain;

namespace Books.APP.Domain;

public class Book: Entity

{
    [Required, StringLength(200)]
    public string Name {get; set;}
    
    public DateTime? PublishDate { get; set; }
    
    public double Price {get; set;}
    
    public short? NumberOfPages {get; set;}
    
    public bool IsTopSeller {get; set;}
    
    public int AuthorId {get; set;}
    
    public Author Author {get; set;}


    public List<BookGenre> BookGenres { get; set; } = new List<BookGenre>();

    [NotMapped]
    public List<int> GenreIds
    {
        get => BookGenres.Select(gg=> gg.GenreId).ToList();
        set => BookGenres = value.Select(v => new BookGenre {GenreId = v}).ToList();
        
    }
}