document.addEventListener('DOMContentLoaded', async () => {
    const eventsContainer = document.getElementById('events-container');
    const today = new Date();
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(today.getMonth() + 6);

    const startDay = today.toISOString().split('T')[0];
    const endDay = sixMonthsLater.toISOString().split('T')[0];

    try {
        const response = await fetch(`http://localhost:8080/events/${startDay}/${endDay}`);
        const events = await response.json();

        if (events.error) {
            throw new Error(events.error);
        }

        eventsContainer.innerHTML = events
            .sort((a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime))
            .map(event => {
                const startDate = new Date(event.start.dateTime);
                const endDate = new Date(event.end.dateTime);

                const startDateStr = startDate.toLocaleDateString('en-US');
                const startTimeStr = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                const endDateStr = endDate.toLocaleDateString('en-US');
                const endTimeStr = endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                return `
                    <div class="event">
                        <h2>${event.summary}</h2>
                        <p>${startDateStr} ${startTimeStr} - ${endDateStr} ${endTimeStr}</p>
                        <p>${event.location}</p>
                        <p>${event.description}</p>
                    </div>
                `;
            })
            .join('');
    } catch (error) {
        console.error('Error:', error);
        eventsContainer.innerHTML = `<p>Error loading events: ${error.message}</p>`;
    }
});
