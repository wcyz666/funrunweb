/**
 * Created by lenovo on 2015/5/2.
 */
$('#newRoom').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var recipient = button.data('whatever');
    var modal = $(this);

});