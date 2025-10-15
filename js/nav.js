navbar = `<nav id="site-nav" class="navbar navbar-dark bg-dark pt-3 pb-3 px-3 justify-content">
    <a class="navbar-brand text-success" href="https://albeto4000.github.io/">MATTHEW DOLIN</a>
    <div>
        <div class="navbar-text text-capitalize">
            ` + document.title + `
        </div>
    </div>
    <button class="btn btn-outline-success btn-sm" data-toggle="modal" data-target="#aboutModal">About</button>
</nav>`;

about_text = `This is my final project for the Web Systems Programming course (CSE264) at Lehigh University. 
            It is a recreation of the first five levels of <i>Journey of the Prairie King</i> from ConcernedApe's 
            game <i>Stardew Valley</i>, written in JavaScript using HTML canvas graphics. The player must avoid enemies for a certain amount of time to progress
            to the next level, and a final boss - the outlaw - must be defeated to win. I'm proud to say 
            that I received an 100% on this project, and the TA who graded it commented that it was "Literally 
            Amazing."
            <br /><br />
            The enemies and projectiles are JavaScript classes. Event handlers track when keys are pressed, 
            a draw function draws each image to the canvas, and an update function controls how the player and 
            enemies move. I used promises to ensure that images display only when all of them are loaded. `

about_modal = `<div class="modal fade" id="aboutModal" tabindex="-1" role="dialog" aria-labelledby="aboutModal" aria-hidden="true">
			<div class="modal-dialog" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">About "` + document.title + `"</h5>
						<button type="button" class="close" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div class="modal-body">
						` + about_text + `
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
					</div>
				</div>
			</div>
		</div>`



document.write(navbar);
document.write(about_modal);