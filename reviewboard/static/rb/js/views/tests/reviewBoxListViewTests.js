describe('views/ReviewBoxListView', function() {
    var template = _.template([
            '<div>',
            ' <a id="collapse-all"></a>',
            ' <a id="expand-all"></a>',
            ' <div class="review" data-review-id="123" data-ship-it="true">',
            '  <div class="box">',
            '   <div class="body">',
            '    <div class="body_top">Body Top</div>',
            '    <div class="body_bottom">Body Bottom</div>',
            '   </div>',
            ' </div>',
            ' </div>',
            ' <div class="review" data-review-id="124" data-ship-it="false">',
            '  <div class="box">',
            '   <div class="body">',
            '    <div class="body_top">Body Top</div>',
            '    <div class="body_bottom">Body Bottom</div>',
            '   </div>',
            '  </div>',
            ' </div>',
            '</div>'
        ].join('')),
        view,
        box1,
        box2;


    beforeEach(function() {
        var reviewRequest = new RB.ReviewRequest(),
            editor = new RB.ReviewRequestEditor({
                reviewRequest: reviewRequest
            })
            $el = $(template()).appendTo($testsScratch);

        view = new RB.ReviewBoxListView({
            el: $el,
            reviewRequest: reviewRequest,
            pageEditState: editor
        });
        view.render();

        expect(view._boxes.length).toBe(2);
        box1 = view._boxes[0];
        box2 = view._boxes[1];
    });

    describe('Actions', function() {
        it('Collapse all', function() {
            view.$('#collapse-all').click();

            expect(box1.$el.find('.box').hasClass('collapsed')).toBe(true);
            expect(box2.$el.find('.box').hasClass('collapsed')).toBe(true);
        });

        it('Expand all', function() {
            var $el1 = box1.$el.find('.box'),
                $el2 = box2.$el.find('.box');

            $el1.addClass('collapsed');
            $el2.addClass('collapsed');

            view.$('#expand-all').click();

            expect($el1.hasClass('collapsed')).toBe(false);
            expect($el2.hasClass('collapsed')).toBe(false);
        });
    });

    describe('Loading', function() {
        it('Body Bottom', function() {
            expect(box1.model.get('bodyBottom')).toBe('Body Bottom');
        });

        it('Body Top', function() {
            expect(box1.model.get('bodyTop')).toBe('Body Top');
        });

        it('Public', function() {
            expect(box1.model.get('public')).toBe(true);
        });

        it('Review ID', function() {
            expect(box1.model.id).toBe(123);
            expect(box2.model.id).toBe(124);
        });

        it('Ship It', function() {
            expect(box1.model.get('shipIt')).toBe(true);
            expect(box2.model.get('shipIt')).toBe(false);
        });
    });
});
