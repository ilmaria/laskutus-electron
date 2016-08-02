import Html exposing (..)
import Html.App as App
--import Html.Attributes exposing (..)
import Section exposing (Section)


main : Program Never
main =
  App.program
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }


-- MODEL

type alias Model =
  { section: Section
  }

type Msg
  = ChangeSection Section

init : (Model, Cmd Msg)
init =
  ( Model Section.init
  , Cmd.none
  )


-- UPDATE

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  (model, Cmd.none)


-- VIEW

view : Model -> Html Msg
view model =
  div []
    [ text "main module" ]


-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none
