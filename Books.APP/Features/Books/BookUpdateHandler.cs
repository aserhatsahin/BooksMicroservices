using System.ComponentModel.DataAnnotations;
using Books.APP.Domain;
using CORE.APP.Models;
using CORE.APP.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Books.APP.Features.Books;

public class BookUpdateRequest : Request, IRequest<CommandResponse>
{
    [Required, StringLength(200)] public string Name { get; set; }
    public short? NumberOfPages { get; set; }

    public DateTime? PublishDate { get; set; }

    public double Price { get; set; }

    public bool IsTopSeller { get; set; }

    public int AuthorId { get; set; }

    public List<int> GenreIds { get; set; }
}

public class BookUpdateHandler : Service<Book>, IRequestHandler<BookUpdateRequest, CommandResponse>
{
    public BookUpdateHandler(DbContext db) : base(db)
    {
    }

    protected override IQueryable<Book> DbSet()
    {
        return base.DbSet().Include(b => b.BookGenres);
    }

    public async Task<CommandResponse> Handle(BookUpdateRequest request, CancellationToken cancellationToken)
    {
        if (await DbSet().AnyAsync(b => b.Id != request.Id && b.Name == request.Name.Trim(), cancellationToken))
            return Error($"Book with the same name: \"{request.Name.Trim()}\" exists!");
        var entity = await DbSet().SingleOrDefaultAsync(b => b.Id == request.Id, cancellationToken);
        if (entity is null)
            return Error("Book not found!");

        Delete(entity.BookGenres);

        entity.GenreIds = request.GenreIds;
        entity.IsTopSeller = request.IsTopSeller;
        entity.Price = request.Price;
        entity.AuthorId = request.AuthorId;
        entity.PublishDate = request.PublishDate;
        entity.Name = request.Name?.Trim();
        entity.NumberOfPages = request.NumberOfPages;
        await UpdateAsync(entity, cancellationToken);
        return Success($"Book with name {request.Name?.Trim()} updated successfully.", entity.Id);
    }
}