using Books.APP.Domain;
using CORE.APP.Models;
using CORE.APP.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Books.APP.Features.Authors;

public class AuthorQueryRequest: Request, IRequest<IQueryable<AuthorQueryResponse>>
{
    
    
}

public class AuthorQueryResponse : Response
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public int BooksCount { get; set; }
    public string Books { get; set; }
    
}

public class AuthorQueryHandler: Service<Author>, IRequestHandler<AuthorQueryRequest,IQueryable<AuthorQueryResponse>>

{
    public AuthorQueryHandler(DbContext db) : base(db)
    {
        
    }

    protected override IQueryable<Author> DbSet()
    {
        return base.DbSet().Include(b => b.Books).OrderByDescending(b => b.Books.Count).ThenBy( b=> b.FirstName + " " + b.LastName);
    }

    public Task<IQueryable<AuthorQueryResponse>> Handle(AuthorQueryRequest request, CancellationToken cancellationToken)
    {
        var query = DbSet().Select(a => new AuthorQueryResponse
        {
            Id = a.Id,
            FirstName = a.FirstName,
            LastName = a.LastName,
            BooksCount = a.Books.Count,
            Books = string.Join(", ", a.Books.Select(b => b.Name))

        });
        return Task.FromResult(query);
    }
}