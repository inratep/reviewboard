/*
 * An editor for replying to parts of a review.
 *
 * This will track the editing state of a reply to the body top/bottom of
 * a review or a comment, and handles saving of the reply.
 */
RB.ReviewReplyEditor = Backbone.Model.extend({
    defaults: {
        contextID: null,
        contextType: null,
        commentID: null,
        hasDraft: false,
        replyObject: null,
        review: null,
        reviewReply: null,
        text: ''
    },

    replyClasses: {
        diff_comments: RB.DiffCommentReply,
        screenshot_comments: RB.ScreenshotCommentReply,
        file_attachment_comments: RB.FileAttachmentCommentReply
    },

    /*
     * Saves the current reply.
     *
     * This will trigger the "saving" event before saving, and will trigger
     * "saved" after it succeeds.
     */
    save: function() {
        var contextType = this.get('contextType'),
            reviewRequest = this.get('review').get('parentObject'),
            reviewReply = this.get('reviewReply'),
            valueAttr,
            ReplyClass,
            obj;

        if (contextType === 'body_top') {
            valueAttr = 'bodyTop';
            obj = reviewReply;
        } else if (contextType === 'body_bottom') {
            valueAttr = 'bodyBottom';
            obj = reviewReply;
        } else {
            valueAttr = 'text';
            obj = this.get('replyObject');

            if (!obj) {
                ReplyClass = this.replyClasses[contextType];

                console.assert(ReplyClass,
                               "Unexpected context type '%s'",
                               contextType);

                obj = new ReplyClass({
                    parentObject: reviewReply,
                    replyToID: this.get('contextID'),
                    id: this.get('commentID')
                });
            }
        }

        this.set('replyObject', obj);

        this.trigger('saving');

        obj.ready({
            ready: function() {
                var text = this.get('text');

                if (text) {
                    obj.set(valueAttr, text);
                    obj.save({
                        success: function() {
                            this.set('hasDraft', true);
                            this.trigger('saved');
                        }
                    }, this);
                } else {
                    this.resetStateIfEmpty();
                }
            }
        }, this);
    },

    /*
     * Resets the editor state, if the text isn't set.
     *
     * If the text attribute has a value, this will do nothing.
     * Otherwise, it will destroy the reply or the comment (depending on
     * what is being replied to), and then trigger "resetState".
     */
    resetStateIfEmpty: function() {
        var text = this.get('text'),
            replyObject = this.get('replyObject');

        if (text.strip() !== '') {
            return;
        }

        if (!replyObject || replyObject.isNew()) {
            this._resetState();
        } else {
            replyObject.destroy({
                success: this._resetState
            }, this);
        }
    },

    /*
     * Resets the state of the editor.
     */
    _resetState: function() {
        this.set({
            commentID: null,
            hasDraft: false,
            replyObject: null
        });

        this.get('reviewReply').discardIfEmpty({
            success: function() {
                this.trigger('resetState');
            }
        }, this);
    }
});
