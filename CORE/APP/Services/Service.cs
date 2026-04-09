using Microsoft.EntityFrameworkCore;

namespace CORE.APP.Services;

public abstract class Service<TEntity> : Service,IDisposable where TEntity : Entity,new()
{
    private readonly DbContext _db;

    protected Service(DbContext db)
    {

        _db = db;
    }
}