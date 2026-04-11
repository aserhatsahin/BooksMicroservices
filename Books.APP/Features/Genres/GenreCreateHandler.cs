using System.ComponentModel.DataAnnotations;
using Books.APP.Domain;
using CORE.APP.Models;
using CORE.APP.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Books.APP.Features.Genres;


public class GenreCreateRequest: Request , IRequest<CommandResponse>
{
    [Required, StringLength(100)]
    public string Name { get; set; }
}

public class GenreCreateHandler: Service<Genre>, IRequestHandler<GenreCreateRequest, CommandResponse >
{
    public GenreCreateHandler(DbContext db) : base(db)
    {
    }

    public async Task<CommandResponse> Handle(GenreCreateRequest request, CancellationToken cancellationToken)
    {
        if (await DbSet().AnyAsync(b => b.Name == request.Name.Trim(), cancellationToken))
            return Error("Genre with the same name already exists");

        var entity = new Genre
        {
            Name = request.Name?.Trim()
        };
        await CreateAsync(entity, cancellationToken);
        return Success("Genre created successfully!",entity.Id);

    }
}