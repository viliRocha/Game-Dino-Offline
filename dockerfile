FROM golang:1.22.5-alpine

WORKDIR /dino

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o dino

CMD ["./dino"]