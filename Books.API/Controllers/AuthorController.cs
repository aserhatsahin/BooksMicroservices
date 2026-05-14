#nullable disable
using Books.APP.Features.Authors;
using CORE.APP.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Books.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthorController : ControllerBase
    {
        private readonly ILogger<AuthorController> _logger;
        private readonly IMediator _mediator;

        public AuthorController(ILogger<AuthorController> logger, IMediator mediator)
        {
            _logger = logger;
            _mediator = mediator;
        }

        // GET: api/Author
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var response = await _mediator.Send(new AuthorQueryRequest());
                var list = await response.ToListAsync();
                if (list.Any())
                    return Ok(list);
                return NoContent();
            }
            catch (Exception exception)
            {
                _logger.LogError("AuthorsGet Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new CommandResponse(false, "An exception occured during AuthorsGet."));
            }
        }

        // GET: api/Author/5
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var response = await _mediator.Send(new AuthorQueryRequest());
                var item = await response.SingleOrDefaultAsync(r => r.Id == id);
                if (item is not null)
                    return Ok(item);
                return NoContent();
            }
            catch (Exception exception)
            {
                _logger.LogError("AuthorsGetById Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new CommandResponse(false, "An exception occured during AuthorsGetById."));
            }
        }

        // POST: api/Author
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Post(AuthorCreateRequest request)
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
                    ModelState.AddModelError("AuthorsPost", response.Message);
                }
                return BadRequest(new CommandResponse(false,
                    string.Join("|", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))));
            }
            catch (Exception exception)
            {
                _logger.LogError("AuthorsPost Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new CommandResponse(false, "An exception occured during AuthorsPost."));
            }
        }

        // PUT: api/Author
        [Authorize(Roles = "Admin")]
        [HttpPut]
        public async Task<IActionResult> Put(AuthorUpdateRequest request)
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
                    ModelState.AddModelError("AuthorsPut", response.Message);
                }
                return BadRequest(new CommandResponse(false,
                    string.Join("|", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))));
            }
            catch (Exception exception)
            {
                _logger.LogError("AuthorsPut Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new CommandResponse(false, "An exception occured during AuthorsPut."));
            }
        }

        // DELETE: api/Author/5
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var response = await _mediator.Send(new AuthorDeleteRequest() { Id = id });
                if (response.IsSuccessful)
                {
                    //return NoContent();
                    return Ok(response);
                }
                ModelState.AddModelError("AuthorsDelete", response.Message);
                return BadRequest(new CommandResponse(false,
                    string.Join("|", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))));
            }
            catch (Exception exception)
            {
                _logger.LogError("AuthorsDelete Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new CommandResponse(false, "An exception occured during AuthorsDelete."));
            }
        }
    }
}
