using System.ComponentModel.DataAnnotations;
using CORE.APP.Domain;

namespace Books.APP.Domain;

public class Author: Entity
{
    [Required,StringLength(100)]
    public string FirstName {get; set;}
    [Required,StringLength(100)]
    public string LastName {get; set;}
    
    public List<Book> Books { get; set; } = new List<Book>();
}