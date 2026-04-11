using Microsoft.AspNetCore.Mvc;

namespace Books.API.Controllers;

public class AuthorsController : Controller
{
    // GET
    public IActionResult Index()
    {
        return View();
    }
}