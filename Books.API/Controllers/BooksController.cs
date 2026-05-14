#nullable disable
using Books.APP.Features.Books;
using CORE.APP.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Books.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly ILogger<BooksController> _logger;
        private readonly IMediator _mediator;

        public BooksController(ILogger<BooksController> logger, IMediator mediator)
        {
            _logger = logger;
            _mediator = mediator;
        }

        // GET: api/Books
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var response = await _mediator.Send(new BookQueryRequest());
                var list = await response.ToListAsync();
                if (list.Any())
                    return Ok(list);
                return NoContent();
            }
            catch (Exception exception)
            {
                _logger.LogError("BooksGet Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new CommandResponse(false, "An exception occured during BooksGet."));
            }
        }

        // GET: api/Books/5
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var response = await _mediator.Send(new BookQueryRequest());
                var item = await response.SingleOrDefaultAsync(r => r.Id == id);
                if (item is not null)
                    return Ok(item);
                return NoContent();
            }
            catch (Exception exception)
            {
                _logger.LogError("BooksGetById Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new CommandResponse(false, "An exception occured during BooksGetById."));
            }
        }

        // POST: api/Books
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Post(BookCreateRequest request)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var response = await _mediator.Send(request);
                    if (response.IsSuccessful)
                    {
                        //return CreatedAtAction(nameof(Get), new { id = response.Id }, response);
                        return Ok(response);
                    }
                    ModelState.AddModelError("BooksPost", response.Message);
                }
                return BadRequest(new CommandResponse(false,
                    string.Join("|", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))));
            }
            catch (Exception exception)
            {
                _logger.LogError("BooksPost Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new CommandResponse(false, "An exception occured during BooksPost."));
            }
        }

        // PUT: api/Books
        [Authorize(Roles = "Admin")]
        [HttpPut]
        public async Task<IActionResult> Put(BookUpdateRequest request)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var response = await _mediator.Send(request);
                    if (response.IsSuccessful)
                    {
                        //return NoContent();
                        return Ok(response);
                    }
                    ModelState.AddModelError("BooksPut", response.Message);
                }
                return BadRequest(new CommandResponse(false,
                    string.Join("|", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))));
            }
            catch (Exception exception)
            {
                _logger.LogError("BooksPut Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new CommandResponse(false, "An exception occured during BooksPut."));
            }
        }

        // DELETE: api/Books/5
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var response = await _mediator.Send(new BookDeleteRequest() { Id = id });
                if (response.IsSuccessful)
                {
                    //return NoContent();
                    return Ok(response);
                }
                ModelState.AddModelError("BooksDelete", response.Message);
                return BadRequest(new CommandResponse(false,
                    string.Join("|", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))));
            }
            catch (Exception exception)
            {
                _logger.LogError("BooksDelete Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new CommandResponse(false, "An exception occured during BooksDelete."));
            }
        }
    }
}
