using Books.APP.Domain;
using Books.APP.Features.Books;
using CORE.APP.Models;
using CORE.APP.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Books.APP.Features.Genres;


public class GenreQueryRequest : Request, IRequest<IQueryable<GenreQueryResponse>>
{
    
    
}

public class GenreQueryResponse : Response
{
    public string Name { get; set; }
    
    public List<BookQueryResponse>  Books { get; set; }
    
    
}

public class GenreQueryHandler : Service<Genre>, IRequestHandler<GenreQueryRequest, IQueryable<GenreQueryResponse>>
{
    public GenreQueryHandler(DbContext db) : base(db)
    {
    }

    protected override IQueryable<Genre> DbSet()
    {
        return base.DbSet().Include( b => b.BookGenres).ThenInclude(bg => bg.Book).OrderBy(g => g.Name);
    }

    public Task<IQueryable<GenreQueryResponse>> Handle(GenreQueryRequest request, CancellationToken cancellationToken)
    {
        var query = DbSet().Select(b => new GenreQueryResponse
        {
            
            Id = b.Id,
            Name = b.Name,
            Books = b.BookGenres.Select(bg => new BookQueryResponse
            {
                Id= bg.Id,  
                IsTopSeller = bg.Book.IsTopSeller,
                NumberOfPages = bg.Book.NumberOfPages,
                Price = bg.Book.Price,
                AuthorId = bg.Book.AuthorId,
                GenreIds = bg.Book.GenreIds,
                PublishDate = bg.Book.PublishDate,
                Name = bg.Book.Name,
                
            }).ToList()
        });
        return Task.FromResult(query);
    }
}
