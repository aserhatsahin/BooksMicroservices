using System.ComponentModel.DataAnnotations;
using Books.APP.Domain;
using CORE.APP.Models;
using CORE.APP.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Books.APP.Features.Books;

public class BookCreateRequest : Request, IRequest<CommandResponse>
{
    
    [Required, StringLength(200)]
    public string Name { get; set; }

    public DateTime? PublishDate { get; set; }
    public short? NumberOfPages {get; set;}
    public double Price { get; set; }

    public bool IsTopSeller { get; set; }

    public int AuthorId { get; set; }

    public List<int> GenreIds { get; set; } = new List<int>();
}




public class BookCreateHandler : Service<Book>, IRequestHandler<BookCreateRequest, CommandResponse>
{
    public BookCreateHandler(DbContext db) : base(db)
    {

    }

    public async Task<CommandResponse> Handle(BookCreateRequest request, CancellationToken cancellationToken)
    {
        if (await DbSet().AnyAsync(b => b.Name == request.Name.Trim(), cancellationToken))
            return Error($"Book with same name : \"{request.Name.Trim()}\" exists!");
        var entity = new Book
        {
            GenreIds = request.GenreIds,
            IsTopSeller = request.IsTopSeller,
            Price = request.Price,
            NumberOfPages =  request.NumberOfPages,
            AuthorId = request.AuthorId,
            PublishDate = request.PublishDate,
            Name = request.Name?.Trim()

        };
        await CreateAsync(entity, cancellationToken);
        return Success($"Book with name {request.Name.Trim()} created successfully.", entity.Id);

    }
}